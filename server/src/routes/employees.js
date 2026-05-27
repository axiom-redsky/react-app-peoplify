const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// GET /api/employees  — 목록 (페이지네이션, 검색)
router.get('/', async (req, res, next) => {
  try {
    const { status, department, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('employees').where((qb) => {
      if (status) qb.where('employment_status', status);
      if (department) qb.where('department', department);
      if (search) {
        qb.where(function () {
          this.where('name', 'ilike', `%${search}%`).orWhere('email', 'ilike', `%${search}%`);
        });
      }
    });

    const [{ count }] = await query.clone().count('* as count');
    const employees = await query
      .clone()
      .orderBy('created_at', 'desc')
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
    const employee = await db('employees').where({ id: req.params.id }).first();
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
    const { name, email, phone, department, position, hire_date, employment_status = 'active', skills = [] } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '이름은 필수입니다.' });
    }

    const [employee] = await db('employees')
      .insert({ name, email, phone, department, position, hire_date, employment_status })
      .returning('*');

    if (skills.length > 0) {
      await db('employee_skills').insert(skills.map((skill) => ({ employee_id: employee.id, skill })));
    }

    res.status(201).json({ success: true, data: { ...employee, skills } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id  — 수정
router.put('/:id', async (req, res, next) => {
  try {
    const { skills, ...fields } = req.body;

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

    res.json({ success: true, data: { ...employee, skills: updatedSkills } });
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
