const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// GET /api/assignments  — 전체 투입현황 (선택적 필터)
// - 기본: 전체 조회
// - paging=true 전달 시에만 페이징 적용
// - employee_id, project_id, department_id, current_only, withdraw_days 선택 필터 지원
router.get('/', async (req, res, next) => {
	try {
		const {
			employee_id,
			project_id,
			department_id,
			current_only,
			withdraw_days,
			paging,
			page = 1,
			page_size = 20,
		} = req.query;

		const usePaging = paging === 'true';
		const currentPage = Math.max(parseInt(page, 10) || 1, 1);
		const pageSize = Math.min(Math.max(parseInt(page_size, 10) || 20, 1), 100);
		const offset = (currentPage - 1) * pageSize;

		// 직원별 최신 assignment 1건
		let query = db('assignments')
			.distinctOn('assignments.employee_id')
			.join('employees', 'assignments.employee_id', 'employees.id')
			.leftJoin('departments', 'employees.department_id', 'departments.id')
			.join('projects', 'assignments.project_id', 'projects.id')
			.select(
				'assignments.id',
				'assignments.role',
				'assignments.rate_pct',
				'assignments.start_date',
				'assignments.end_date',
				'employees.id as employee_id',
				'employees.name as employee_name',
				'departments.id as department_id',
				'departments.name as department',
				'projects.id as project_id',
				'projects.name as project_name',
				'projects.client',
				db.raw(`
					(
						assignments.start_date <= CURRENT_DATE
						AND (
							assignments.end_date IS NULL
							OR assignments.end_date >= CURRENT_DATE
						)
					) AS is_current
				`)
			)
			.orderBy([
				{ column: 'assignments.employee_id' },
				{
					column: db.raw(`
						CASE
							WHEN assignments.end_date IS NULL
								OR assignments.end_date >= CURRENT_DATE
							THEN 0
							ELSE 1
						END
					`)
				},
				{ column: 'assignments.start_date', order: 'desc' },
				{ column: 'assignments.id', order: 'desc' },
			]);

		// 직원 필터
		if (employee_id) {
			query.where('assignments.employee_id', employee_id);
		}

		// 프로젝트 필터
		if (project_id) {
			query.where('assignments.project_id', project_id);
		}

		// 부서 필터
		if (department_id && department_id !== 'all') {
			query.where('departments.id', department_id);
		}

		// 현재 투입중만
		if (current_only === 'true') {
			query
				.where('assignments.start_date', '<=', db.raw('CURRENT_DATE'))
				.where(function () {
					this.whereNull('assignments.end_date').orWhere(
						'assignments.end_date',
						'>=',
						db.raw('CURRENT_DATE')
					);
				});
		}

		// 철수 임박
		if (withdraw_days && withdraw_days !== 'all') {
			const days = Number(withdraw_days);

			query
				.whereNotNull('assignments.end_date')
				.whereBetween('assignments.end_date', [
					db.raw('CURRENT_DATE'),
					db.raw(`CURRENT_DATE + INTERVAL '${days} days'`),
				]);
		}

		if (!usePaging) {
			const data = await query;

			return res.json({
				success: true,
				data,
			});
		}

		const allData = await query.clone();

		const total = allData.length;

		const data = allData.slice(offset, offset + pageSize);

		return res.json({
			success: true,
			data,
			pagination: {
				page: currentPage,
				page_size: pageSize,
				total,
				total_pages: Math.ceil(total / pageSize),
				has_next: currentPage < Math.ceil(total / pageSize),
				has_prev: currentPage > 1,
			},
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/assignments  — 투입 등록 (단일 또는 다중 employee_id 지원)
router.post('/', async (req, res, next) => {
	try {
		const { employee_id, project_id, role, rate_pct = 100, start_date, end_date } = req.body;

		const employeeIds = Array.isArray(employee_id) ? employee_id : [employee_id];

		const validEmployeeIds = employeeIds
			.filter((id) => id !== undefined && id !== null && id !== '')
			.map((id) => Number(id));

		const uniqueEmployeeIds = [...new Set(validEmployeeIds)];

		if (!uniqueEmployeeIds.length || !project_id || !start_date) {
			return res.status(400).json({
				success: false,
				message: '직원, 프로젝트, 투입 시작일은 필수입니다.',
			});
		}

		const getAssignmentStatus = (startDate, endDate) => {
			const today = new Date();
			const todayText = today.toISOString().slice(0, 10);

			if (startDate > todayText) {
				return 'SCHEDULED';
			}

			if (endDate && endDate < todayText) {
				return 'ENDED';
			}

			return 'ACTIVE';
		};

		const result = await db.transaction(async (trx) => {
			// 프로젝트 스냅샷 조회
			const project = await trx('projects').where({ id: project_id }).select('id', 'name', 'client').first();

			if (!project) {
				const error = new Error('프로젝트를 찾을 수 없습니다.');
				error.status = 404;
				throw error;
			}

			// 직원 스냅샷 조회
			const employees = await trx('employees')
				.leftJoin('departments', 'employees.department_id', 'departments.id')
				.whereIn('employees.id', uniqueEmployeeIds)
				.select('employees.id', 'employees.name', 'employees.position', 'departments.name as department');

			const employeeMap = new Map(employees.map((employee) => [Number(employee.id), employee]));

			const missingEmployeeIds = uniqueEmployeeIds.filter((id) => !employeeMap.has(Number(id)));

			if (missingEmployeeIds.length > 0) {
				const error = new Error(`존재하지 않는 직원 ID가 있습니다. (${missingEmployeeIds.join(', ')})`);
				error.status = 400;
				throw error;
			}

			// assignments 등록 데이터
			const assignmentRows = uniqueEmployeeIds.map((eid) => ({
				employee_id: eid,
				project_id,
				role,
				rate_pct,
				start_date,
				end_date: end_date || null,
			}));

			const assignments = await trx('assignments').insert(assignmentRows).returning('*');

			// assignment_history 등록 데이터
			const historyRows = assignments.map((assignment) => {
				const employee = employeeMap.get(Number(assignment.employee_id));

				return {
					assignment_id: assignment.id,
					employee_id: assignment.employee_id,
					project_id: assignment.project_id,

					employee_name: employee.name,
					department: employee.department || null,
					position: employee.position || null,

					project_name: project.name,
					client: project.client || null,

					role: assignment.role || null,
					rate_pct: assignment.rate_pct || 100,
					start_date: assignment.start_date,
					end_date: assignment.end_date || null,

					action_type: 'ASSIGNED',
					status: getAssignmentStatus(assignment.start_date, assignment.end_date),
				};
			});

			await trx('assignment_history').insert(historyRows);

			return assignments;
		});

		res.status(201).json({
			success: true,
			data: result,
		});
	} catch (err) {
		if (err.status) {
			return res.status(err.status).json({
				success: false,
				message: err.message,
			});
		}

		next(err);
	}
});

// PUT /api/assignments/:id  — 수정 (역할, rate_pct, end_date)
router.put('/:id', async (req, res, next) => {
	try {
		const { role, rate_pct, end_date } = req.body;

		const [assignment] = await db('assignments')
			.where({ id: req.params.id })
			.update({ role, rate_pct, end_date, updated_at: db.raw('NOW()') })
			.returning('*');

		if (!assignment) {
			return res.status(404).json({ success: false, message: '투입 정보를 찾을 수 없습니다.' });
		}

		res.json({ success: true, data: assignment });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/assignments/:id  — 철수 (end_date = today)
// DELETE /api/assignments/:id  — 투입 철수 처리
router.delete('/:id', async (req, res, next) => {
	try {
		const result = await db.transaction(async (trx) => {
			// 1. assignments 철수 처리
			const [assignment] = await trx('assignments')
				.where({ id: req.params.id })
				.update({
					end_date: trx.raw('CURRENT_DATE'),
					updated_at: trx.raw('NOW()'),
				})
				.returning('*');

			if (!assignment) {
				const error = new Error('투입 정보를 찾을 수 없습니다.');
				error.status = 404;
				throw error;
			}

			// 오늘 날짜 기준으로 예정 투입이면 취소, 이미 시작된 투입이면 종료 처리
			const todayText = new Date().toISOString().slice(0, 10);
			const startDateText =
				assignment.start_date instanceof Date
					? assignment.start_date.toISOString().slice(0, 10)
					: String(assignment.start_date).slice(0, 10);

			const historyStatus = startDateText > todayText ? 'CANCELED' : 'ENDED';

			// 2. 기존 assignment_history가 있는지 확인
			const latestHistory = await trx('assignment_history')
				.where({ assignment_id: assignment.id })
				.orderBy('created_at', 'desc')
				.orderBy('id', 'desc')
				.first('id');

			if (latestHistory) {
				// 3-A. 기존 히스토리가 있으면 해당 이력 상태 업데이트
				await trx('assignment_history')
					.where({ id: latestHistory.id })
					.update({
						end_date: trx.raw('CURRENT_DATE'),
						action_type: 'REMOVED',
						status: historyStatus,
						updated_at: trx.raw('NOW()'),
					});
			} else {
				// 3-B. 기존 히스토리가 없으면, 과거 assignments 데이터 기준으로 히스토리 신규 생성
				// assignment_history 도입 전 등록된 투입 데이터를 철수하는 경우를 대비한 처리
				const snapshot = await trx('assignments')
					.leftJoin('employees', 'assignments.employee_id', 'employees.id')
					.leftJoin('departments', 'employees.department_id', 'departments.id')
					.leftJoin('projects', 'assignments.project_id', 'projects.id')
					.where('assignments.id', assignment.id)
					.select(
						'assignments.id as assignment_id',
						'assignments.employee_id',
						'assignments.project_id',
						'assignments.role',
						'assignments.rate_pct',
						'assignments.start_date',
						'assignments.end_date',
						'employees.name as employee_name',
						'employees.position',
						'departments.name as department',
						'projects.name as project_name',
						'projects.client',
					)
					.first();

				if (snapshot) {
					await trx('assignment_history').insert({
						assignment_id: snapshot.assignment_id,
						employee_id: snapshot.employee_id,
						project_id: snapshot.project_id,

						employee_name: snapshot.employee_name,
						department: snapshot.department || null,
						position: snapshot.position || null,

						project_name: snapshot.project_name,
						client: snapshot.client || null,

						role: snapshot.role || null,
						rate_pct: snapshot.rate_pct || 100,
						start_date: snapshot.start_date,
						end_date: trx.raw('CURRENT_DATE'),

						action_type: 'REMOVED',
						status: historyStatus,
						created_at: trx.raw('NOW()'),
						updated_at: trx.raw('NOW()'),
					});
				}
			}

			return assignment;
		});

		res.json({
			success: true,
			message: '철수 처리되었습니다.',
			data: result,
		});
	} catch (err) {
		if (err.status) {
			return res.status(err.status).json({
				success: false,
				message: err.message,
			});
		}

		next(err);
	}
});

module.exports = router;
