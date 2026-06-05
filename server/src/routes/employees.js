const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// 요청 본문에서 부서 식별자를 해석한다.
//   - department_id 가 있으면 그대로 사용
//   - 없고 department(부서명)가 있으면 departments에서 id 조회 (없으면 null)
//   - 둘 다 없으면 undefined (수정 시 해당 필드 미변경 의미)
async function resolveDepartmentId(body) {
  if (body.department_id !== undefined) {
    return body.department_id === null ? null : Number(body.department_id);
  }
  if (body.department !== undefined) {
    if (!body.department) return null;
    const dept = await db('departments').where({ name: body.department }).first();
    return dept ? dept.id : null;
  }
  return undefined;
}

// GET /api/employees  — 목록 (페이지네이션, 검색)
router.get('/', async (req, res, next) => {
  try {
    const { status, department, department_id, search, deployment_status, page = 1, limit = 20 } =
      req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // 현재 투입 중(EXISTS)인지 판정하는 서브쿼리.
    //   현재 투입 = start_date <= TODAY AND (end_date IS NULL OR end_date >= TODAY)
    const currentAssignmentExists = (subquery) => {
      subquery
        .select(db.raw('1'))
        .from('assignments')
        .whereRaw('assignments.employee_id = employees.id')
        .where('assignments.start_date', '<=', db.raw('CURRENT_DATE'))
        .where(function () {
          this.whereNull('assignments.end_date').orWhere(
            'assignments.end_date',
            '>=',
            db.raw('CURRENT_DATE'),
          );
        });
    };

    let query = db('employees')
      .leftJoin('departments', 'employees.department_id', 'departments.id')
      .where((qb) => {
        if (status) qb.where('employees.employment_status', status);
        if (department_id) qb.where('employees.department_id', department_id);
        if (department) qb.where('departments.name', department);
        // 투입상태(DEPLOYMENT_STATUS): assignments 기반 파생값
        if (deployment_status === 'deployed') qb.whereExists(currentAssignmentExists);
        if (deployment_status === 'bench') qb.whereNotExists(currentAssignmentExists);
        if (search) {
          qb.where(function () {
            this.where('employees.name', 'ilike', `%${search}%`).orWhere(
              'employees.email',
              'ilike',
              `%${search}%`,
            );
          });
        }
      });

    const [{ count }] = await query.clone().count('employees.id as count');
    const employees = await query
      .clone()
      .select('employees.*', 'departments.name as department')
      .orderBy('employees.created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // 기술스택 일괄 조회
    const ids = employees.map((e) => e.id);
    const skills =
      ids.length > 0 ? await db('employee_skills').whereIn('employee_id', ids) : [];

    const data = employees.map((emp) => ({
      ...emp,
      skills: skills.filter((s) => s.employee_id === emp.id).map((s) => s.skill),
    }));

    res.json({
      success: true,
      data,
      meta: { total: Number(count), page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id  — 상세
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await db('employees')
      .leftJoin('departments', 'employees.department_id', 'departments.id')
      .where('employees.id', req.params.id)
      .select('employees.*', 'departments.name as department')
      .first();
    if (!employee) {
      return res.status(404).json({ success: false, message: '직원을 찾을 수 없습니다.' });
    }

    const skills = await db('employee_skills')
      .where({ employee_id: employee.id })
      .pluck('skill');

    const assignmentHistory = await db('assignments')
      .join('projects', 'assignments.project_id', 'projects.id')
      .where('assignments.employee_id', employee.id)
      .select(
        'assignments.id',
        'assignments.role',
        'assignments.rate_pct',
        'assignments.start_date',
        'assignments.end_date',
        'projects.name as project_name',
        'projects.client',
        'projects.status as project_status',
      )
      .orderBy('assignments.start_date', 'desc');

    res.json({ success: true, data: { ...employee, skills, assignment_history: assignmentHistory } });
  } catch (err) {
    next(err);
  }
});

// POST /api/employees  — 등록
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, position, hire_date, employment_status = 'active', skills = [] } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '이름은 필수입니다.' });
    }

    const department_id = await resolveDepartmentId(req.body);

    const [employee] = await db('employees')
      .insert({ name, email, phone, department_id, position, hire_date, employment_status })
      .returning('*');

    if (skills.length > 0) {
      await db('employee_skills').insert(skills.map((skill) => ({ employee_id: employee.id, skill })));
    }

    // 응답에 부서명을 포함 (응답 계약 유지)
    const dept = employee.department_id
      ? await db('departments').where({ id: employee.department_id }).first()
      : null;

    res.status(201).json({ success: true, data: { ...employee, department: dept ? dept.name : null, skills } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id  — 수정
router.put('/:id', async (req, res, next) => {
  try {
    // department / department_id 는 별도 해석하고, 원본 필드에서는 제외
    const { skills, department, department_id, ...fields } = req.body;

    const resolvedDeptId = await resolveDepartmentId(req.body);
    if (resolvedDeptId !== undefined) fields.department_id = resolvedDeptId;

    const [employee] = await db('employees')
      .where({ id: req.params.id })
      .update({ ...fields, updated_at: db.raw('NOW()') })
      .returning('*');

    if (!employee) {
      return res.status(404).json({ success: false, message: '직원을 찾을 수 없습니다.' });
    }

    if (skills !== undefined) {
      await db('employee_skills').where({ employee_id: employee.id }).del();
      if (skills.length > 0) {
        await db('employee_skills').insert(
          skills.map((skill) => ({ employee_id: employee.id, skill })),
        );
      }
    }

    const updatedSkills = await db('employee_skills')
      .where({ employee_id: employee.id })
      .pluck('skill');

    const dept = employee.department_id
      ? await db('departments').where({ id: employee.department_id }).first()
      : null;

    res.json({
      success: true,
      data: { ...employee, department: dept ? dept.name : null, skills: updatedSkills },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id  — 소프트 삭제 (employment_status = 'resigned')
router.delete('/:id', async (req, res, next) => {
  try {
    const [employee] = await db('employees')
      .where({ id: req.params.id })
      .update({ employment_status: 'resigned', updated_at: db.raw('NOW()') })
      .returning('id');

    if (!employee) {
      return res.status(404).json({ success: false, message: '직원을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '직원이 퇴사 처리되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
