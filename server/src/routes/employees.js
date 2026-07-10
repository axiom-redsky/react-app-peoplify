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
		const { status, department, department_id, search, deployment_status, page = 1, limit = 20 } = req.query;
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
					this.whereNull('assignments.end_date').orWhere('assignments.end_date', '>=', db.raw('CURRENT_DATE'));
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
						this.where('employees.name', 'ilike', `%${search}%`).orWhere('employees.email', 'ilike', `%${search}%`);
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
		const skills = ids.length > 0 ? await db('employee_skills').whereIn('employee_id', ids) : [];

		const data = employees.map((emp) => ({
			...emp,
			skills: skills.filter((s) => s.employee_id === emp.id).map((s) => s.skill),
		}));

		res.json({
			success: true,
			data,
			meta: { total: Number(count), page: Number(page), limit: Number(limit) },
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			success: false,
			message: '직원 조회 중 오류가 발생했습니다.',
		});
	}
});

// GET /api/employees/excel
// 직원 목록 엑셀 다운로드 전용 조회
// 화면 페이지네이션과 무관하게 현재 검색/필터 조건에 맞는 전체 직원을 조회한다.
router.get('/excel', async (req, res, next) => {
	try {
		const { search, department, status, deployment_status } = req.query;

		let query = db('employees')
			.leftJoin('departments', 'employees.department_id', 'departments.id')
			.select(
				'employees.id',
				'employees.name',
				'employees.email',
				'employees.phone',
				'departments.name as department',
				'employees.position',
				'employees.job_role_code',
				'employees.employment_status',
				'employees.hire_date',
				'employees.created_at',
				'employees.updated_at',
			)
			.orderBy('employees.name', 'asc');

		if (search) {
			query = query.where(function () {
				this.where('employees.name', 'like', `%${search}%`)
					.orWhere('employees.email', 'like', `%${search}%`)
					.orWhere('employees.phone', 'like', `%${search}%`);
			});
		}

		if (department) {
			query = query.where('departments.name', department);
		}

		if (status) {
			query = query.where('employees.employment_status', status);
		}

		// 투입상태 필터
		// deployed / bench 값은 실제 DEPLOYMENT_STATUS 공통코드 code 값에 맞춰 조정해야 한다.
		if (deployment_status) {
			if (deployment_status === 'deployed') {
				query = query.whereExists(function () {
					this.select('*')
						.from('assignments')
						.whereRaw('assignments.employee_id = employees.id')
						.where(function () {
							this.whereNull('assignments.end_date').orWhere('assignments.end_date', '>', db.raw('CURRENT_DATE'));
						});
				});
			}

			if (deployment_status === 'bench') {
				query = query.whereNotExists(function () {
					this.select('*')
						.from('assignments')
						.whereRaw('assignments.employee_id = employees.id')
						.where(function () {
							this.whereNull('assignments.end_date').orWhere('assignments.end_date', '>', db.raw('CURRENT_DATE'));
						});
				});
			}
		}

		const employees = await query;
		const employeeIds = employees.map((employee) => employee.id);

		const skills =
			employeeIds.length > 0
				? await db('employee_skills').select('employee_id', 'skill').whereIn('employee_id', employeeIds)
				: [];

		const currentAssignments =
			employeeIds.length > 0
				? await db('assignments')
						.leftJoin('projects', 'assignments.project_id', 'projects.id')
						.select('assignments.employee_id', 'projects.name as project_name')
						.whereIn('assignments.employee_id', employeeIds)
						.where(function () {
							this.whereNull('assignments.end_date').orWhere('assignments.end_date', '>', db.raw('CURRENT_DATE'));
						})
				: [];

		const jobRoleCodes = employees.map((employee) => employee.job_role_code).filter(Boolean);

		const jobRoles =
			jobRoleCodes.length > 0
				? await db('common_code')
						.select('code', 'code_name')
						.where('group_code', 'JOB_ROLE')
						.whereIn('code', jobRoleCodes)
				: [];

		const skillMap = skills.reduce((acc, row) => {
			if (!acc[row.employee_id]) acc[row.employee_id] = [];
			acc[row.employee_id].push(row.skill);
			return acc;
		}, {});

		const projectMap = currentAssignments.reduce((acc, row) => {
			if (!acc[row.employee_id]) acc[row.employee_id] = [];
			if (row.project_name) acc[row.employee_id].push(row.project_name);
			return acc;
		}, {});

		const jobRoleMap = jobRoles.reduce((acc, row) => {
			acc[row.code] = row.code_name;
			return acc;
		}, {});

		const data = employees.map((employee) => ({
			...employee,
			skills: skillMap[employee.id] ?? [],
			current_projects: projectMap[employee.id] ?? [],
			job_role_name: employee.job_role_code ? (jobRoleMap[employee.job_role_code] ?? employee.job_role_code) : '-',
		}));

		res.json({
			success: true,
			data,
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/employees/status
router.get('/status', async (req, res, next) => {
	try {
		const { department_id, status, withdraw_days, page = 1, page_size = 20, paging } = req.query;

		const usePaging = paging === 'true';
		const currentPage = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(page_size) || 20, 1), 100);
		const offset = (currentPage - 1) * pageSize;

		// 직원별 최신 assignment 1건
		const latestAssignment = db
			.select(
				'a.employee_id',
				'a.project_id',
				'a.role',
				'a.rate_pct',
				'a.start_date',
				'a.end_date',
				db.raw(`
					ROW_NUMBER() OVER (
						PARTITION BY a.employee_id
						ORDER BY
							a.start_date DESC,
							a.id DESC
					) rn
				`),
			)
			.from({ a: 'assignments' })
			.as('la');

		let query = db('employees as e')
			.leftJoin('departments as d', 'e.department_id', 'd.id')
			.leftJoin(latestAssignment, function () {
				this.on('e.id', '=', 'la.employee_id').andOn('la.rn', '=', db.raw('1'));
			})
			.leftJoin('projects as p', 'la.project_id', 'p.id')
			.select(
	'e.id as employee_id',
	'e.name as employee_name',
	'e.job_role_code',
	'd.id as department_id',
	'd.name as department',

	'la.project_id',
	'p.name as project_name',
	'p.client',

	'la.role',
	'la.rate_pct',
	'la.start_date',
	'la.end_date',

	db.raw(`
		CASE
			WHEN la.employee_id IS NULL THEN 'bench'
			WHEN la.end_date IS NULL OR la.end_date >= CURRENT_DATE THEN 'deployed'
			ELSE 'completed'
		END AS status
	`),
);

		// 부서
		if (department_id && department_id !== 'all') {
			query.where('d.id', department_id);
		}

		// 상태
		if (status && status !== 'all') {
			if (status === 'bench') {
				query.whereNull('la.employee_id');
			} else if (status === 'deployed') {
				query.whereNotNull('la.employee_id').where(function () {
					this.whereNull('la.end_date').orWhere('la.end_date', '>=', db.raw('CURRENT_DATE'));
				});
			} else if (status === 'completed') {
				query.whereNotNull('la.end_date').where('la.end_date', '<', db.raw('CURRENT_DATE'));
			}
		}

		// 철수 예정
		if (withdraw_days && withdraw_days !== 'all') {
			const days = Number(withdraw_days);

			query
				.whereNotNull('la.end_date')
				.whereBetween('la.end_date', [db.raw('CURRENT_DATE'), db.raw(`CURRENT_DATE + INTERVAL '${days} days'`)]);
		}

		query.orderBy('e.name');

		if (!usePaging) {
			const data = await query;
			return res.json({ success: true, data });
		}

		const countResult = await query.clone().clearSelect().clearOrder().countDistinct({ total: 'e.id' }).first();

		const total = Number(countResult.total);

		const data = await query.limit(pageSize).offset(offset);

		return res.json({
			success: true,
			data,
			pagination: {
				page: currentPage,
				page_size: pageSize,
				total,
				total_pages: Math.ceil(total / pageSize),
				has_next: currentPage * pageSize < total,
				has_prev: currentPage > 1,
			},
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
			return res.status(404).json({
				success: false,
				message: '직원을 찾을 수 없습니다.',
			});
		}

		const skills = await db('employee_skills').where({ employee_id: employee.id }).pluck('skill');

		// 투입 이력 조회
		// 기존 assignments + projects 현재값 조회가 아니라
		// assignment_history에 저장된 당시 스냅샷 기준으로 조회
		const assignmentHistory = await db('assignment_history')
			.where('employee_id', employee.id)
			.select(
				'id',
				'assignment_id',
				'employee_id',
				'project_id',
				'project_name',
				'client',
				'role',
				'rate_pct',
				'start_date',
				'end_date',
				'action_type',
				'status',
				'status as project_status',
				'created_at',
				'updated_at',
			)
			.orderBy('start_date', 'desc')
			.orderBy('created_at', 'desc');

		const contractHistory = await db('assignments')
			.join('projects', 'assignments.project_id', 'projects.id')
			.where('assignments.employee_id', employee.id)
			.select(
				'assignments.id as assignment_id',
				'assignments.project_id',
				'projects.name as project_name',
				'projects.client',
				'assignments.role',
				'assignments.contract_start_date',
				'assignments.contract_end_date',
				'assignments.total_amount',
				'assignments.performance_rating',
			)
			.orderBy('assignments.contract_start_date', 'desc');

		res.json({
			success: true,
			data: {
				...employee,
				skills,
				assignment_history: assignmentHistory,
				contracts: contractHistory,
			},
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			success: false,
			message: '직원 조회 중 오류가 발생했습니다.',
		});
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
			.insert({
				name,
				email,
				phone,
				department_id,
				position,
				hire_date,
				employment_status,
				job_role_code: req.body.job_role_code,
			})
			.returning('*');

		if (skills.length > 0) {
			await db('employee_skills').insert(skills.map((skill) => ({ employee_id: employee.id, skill })));
		}

		// 응답에 부서명을 포함 (응답 계약 유지)
		const dept = employee.department_id ? await db('departments').where({ id: employee.department_id }).first() : null;

		res.status(201).json({ success: true, data: { ...employee, department: dept ? dept.name : null, skills } });
	} catch (error) {
		if (error.code === '23505' && error.constraint === 'employees_email_unique') {
			return res.status(409).json({
				success: false,
				message: '이미 등록된 이메일입니다.',
			});
		}

		console.error(error);

		return res.status(500).json({
			success: false,
			message: '직원 등록 중 오류가 발생했습니다.',
		});
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
				await db('employee_skills').insert(skills.map((skill) => ({ employee_id: employee.id, skill })));
			}
		}

		const updatedSkills = await db('employee_skills').where({ employee_id: employee.id }).pluck('skill');

		const dept = employee.department_id ? await db('departments').where({ id: employee.department_id }).first() : null;

		res.json({
			success: true,
			data: { ...employee, department: dept ? dept.name : null, skills: updatedSkills },
		});
	} catch (error) {
		if (error.code === '23505' && error.constraint === 'employees_email_unique') {
			return res.status(409).json({
				success: false,
				message: '이미 등록된 이메일입니다.',
			});
		}

		console.error(error);

		return res.status(500).json({
			success: false,
			message: '직원 등록 중 오류가 발생했습니다.',
		});
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
