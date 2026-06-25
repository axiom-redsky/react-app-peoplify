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

		// 기술스택 일괄 조회
		const ids = projects.map((p) => p.id);
		const techStack = ids.length > 0 ? await db('project_tech_stack').whereIn('project_id', ids) : [];

		const data = projects.map((proj) => ({
			...proj,
			tech_stack: techStack.filter((t) => t.project_id === proj.id).map((t) => t.tech),
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

		const assignments = await db('assignments')
			.join('employees', 'assignments.employee_id', 'employees.id')
			.leftJoin('departments', 'employees.department_id', 'departments.id')
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
				'employees.position',
			)
			.orderBy('assignments.start_date', 'desc');

		res.json({
			success: true,
			data: {
				...project,
				tech_stack: techStack,
				assignments,
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

    const project = await db('projects')
      .where({ id: projectId })
      .first();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.',
      });
    }

    await db.transaction(async (trx) => {
      // 프로젝트 투입 정보 삭제
      await trx('assignments')
        .where({ project_id: projectId })
        .del();

      // 프로젝트 기술스택 삭제
      await trx('project_tech_stack')
        .where({ project_id: projectId })
        .del();

      // 프로젝트 삭제
      await trx('projects')
        .where({ id: projectId })
        .del();
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
