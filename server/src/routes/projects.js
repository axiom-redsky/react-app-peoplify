const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// GET /api/projects  — 목록
router.get('/', async (req, res, next) => {
	try {
		const { status } = req.query;

		let query = db('projects').orderBy('created_at', 'desc').orderBy('start_date', 'desc');

		if (status) query = query.where('status', status);

		const projects = await query;

		const ids = projects.map((p) => p.id);

		// 기술스택 일괄 조회
		const techStack = ids.length > 0 ? await db('project_tech_stack').whereIn('project_id', ids) : [];

		// 프로젝트별 투입인력 수 일괄 조회
		// 같은 직원이 중복 배정되어도 1명으로 계산하기 위해 employee_id 기준 distinct count 사용
		const memberCounts =
			ids.length > 0
				? await db('assignments')
						.select('project_id')
						.countDistinct({ member_count: 'employee_id' })
						.whereIn('project_id', ids)
						.where(function () {
							this.whereNull('end_date').orWhere('end_date', '>', db.raw('CURRENT_DATE'));
						})
						.groupBy('project_id')
				: [];

		// project_id별 기술스택 목록 맵 생성
		const techStackMap = techStack.reduce((acc, row) => {
			if (!acc[row.project_id]) acc[row.project_id] = [];
			acc[row.project_id].push(row.tech);
			return acc;
		}, {});

		// project_id별 투입인력 수 맵 생성
		const memberCountMap = memberCounts.reduce((acc, row) => {
			acc[row.project_id] = Number(row.member_count ?? 0);
			return acc;
		}, {});

		const data = projects.map((proj) => ({
			...proj,
			tech_stack: techStackMap[proj.id] ?? [],
			member_count: memberCountMap[proj.id] ?? 0,
		}));

		res.json({ success: true, data });
	} catch (err) {
		next(err);
	}
});

// GET /api/projects/:id  — 상세 + 기술스택 + 투입인원
router.get('/:id', async (req, res, next) => {
	try {
		const project = await db('projects').where({ id: req.params.id }).first();

		if (!project) {
			return res.status(404).json({
				success: false,
				message: '프로젝트를 찾을 수 없습니다.',
			});
		}

		const techStack = await db('project_tech_stack').where({ project_id: project.id }).pluck('tech');

		// 직무 옵션: JOB_ROLE
		const jobRoleOptions = await db('common_code')
			.where('group_code', 'JOB_ROLE')
			.select('code', 'code_name', 'parent_code', 'sort_order')
			.orderBy('sort_order', 'asc');

		// 직무구분 옵션: JOB_ROLE_CATEGORY
		const jobRoleCategoryOptions = await db('common_code')
			.where('group_code', 'JOB_ROLE_CATEGORY')
			.select('code', 'code_name', 'parent_code', 'sort_order')
			.orderBy('sort_order', 'asc');

		const assignments = await db('assignments')
			.join('employees', 'assignments.employee_id', 'employees.id')
			.leftJoin('departments', 'employees.department_id', 'departments.id')

			// 직원 직무 코드: employees.job_role_code -> common_code(JOB_ROLE)
			.leftJoin({ jobRole: 'common_code' }, function () {
				this.on('employees.job_role_code', '=', 'jobRole.code').andOn(
					'jobRole.group_code',
					'=',
					db.raw('?', ['JOB_ROLE']),
				);
			})

			// 직무구분 코드: jobRole.parent_code -> common_code(JOB_ROLE_CATEGORY)
			.leftJoin({ jobRoleCategory: 'common_code' }, function () {
				this.on('jobRole.parent_code', '=', 'jobRoleCategory.code').andOn(
					'jobRoleCategory.group_code',
					'=',
					db.raw('?', ['JOB_ROLE_CATEGORY']),
				);
			})

			// 직원 직급 코드: employees.position -> common_code(POSITION)
			.leftJoin({ positionCode: 'common_code' }, function () {
				this.on('employees.position', '=', 'positionCode.code').andOn(
					'positionCode.group_code',
					'=',
					db.raw('?', ['POSITION']),
				);
			})

			.where('assignments.project_id', project.id)
			.where(function () {
				this.whereNull('assignments.end_date').orWhere('assignments.end_date', '>', db.raw('CURRENT_DATE'));
			})
			.select(
				'assignments.id',
				'assignments.role',
				'assignments.rate_pct',
				'assignments.start_date',
				'assignments.end_date',

				'employees.id as employee_id',
				'employees.name as employee_name',
				'departments.name as department',

				// 직원 직급 정보
				'employees.position',
				'positionCode.code_name as position_name',

				// 직원 직무 정보
				'employees.job_role_code as job_role_code',
				'jobRole.code_name as job_role_name',

				// 직원 직무구분 정보
				'jobRole.parent_code as job_role_category_code',
				'jobRoleCategory.code_name as job_role_category_name',
			)
			.orderBy('assignments.start_date', 'desc');

		res.json({
			success: true,
			data: {
				...project,
				tech_stack: techStack,
				assignments,
				jobRoleOptions,
				jobRoleCategoryOptions,
			},
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/projects  — 등록
router.post('/', async (req, res, next) => {
	try {
		const {
			name,
			client,
			start_date,
			end_date,
			status = 'planned',
			progress_pct = 0,
			description,
			tech_stack = [],
		} = req.body;

		if (!name) {
			return res.status(400).json({ success: false, message: '프로젝트명은 필수입니다.' });
		}

		const [project] = await db('projects')
			.insert({ name, client, start_date, end_date, status, progress_pct, description })
			.returning('*');

		if (tech_stack.length > 0) {
			await db('project_tech_stack').insert(tech_stack.map((tech) => ({ project_id: project.id, tech })));
		}

		res.status(201).json({ success: true, data: { ...project, tech_stack } });
	} catch (err) {
		next(err);
	}
});

// PUT /api/projects/:id  — 수정
router.put('/:id', async (req, res, next) => {
	try {
		const { tech_stack, ...fields } = req.body;

		const [project] = await db('projects')
			.where({ id: req.params.id })
			.update({ ...fields, updated_at: db.raw('NOW()') })
			.returning('*');

		if (!project) {
			return res.status(404).json({ success: false, message: '프로젝트를 찾을 수 없습니다.' });
		}

		if (tech_stack !== undefined) {
			await db('project_tech_stack').where({ project_id: project.id }).del();
			if (tech_stack.length > 0) {
				await db('project_tech_stack').insert(tech_stack.map((tech) => ({ project_id: project.id, tech })));
			}
		}

		const updatedStack = await db('project_tech_stack').where({ project_id: project.id }).pluck('tech');

		res.json({ success: true, data: { ...project, tech_stack: updatedStack } });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/projects/:id — 프로젝트 삭제
router.delete('/:id', async (req, res, next) => {
	try {
		const projectId = Number(req.params.id);

		if (!projectId) {
			return res.status(400).json({
				success: false,
				message: '프로젝트 ID가 올바르지 않습니다.',
			});
		}

		const project = await db('projects').where({ id: projectId }).first();

		if (!project) {
			return res.status(404).json({
				success: false,
				message: '프로젝트를 찾을 수 없습니다.',
			});
		}

		await db.transaction(async (trx) => {
			// 프로젝트 투입 정보 삭제
			await trx('assignments').where({ project_id: projectId }).del();

			// 프로젝트 기술스택 삭제
			await trx('project_tech_stack').where({ project_id: projectId }).del();

			// 프로젝트 삭제
			await trx('projects').where({ id: projectId }).del();
		});

		return res.json({
			success: true,
			message: '프로젝트가 삭제되었습니다.',
			data: {
				id: projectId,
			},
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
