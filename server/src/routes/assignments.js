const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// GET /api/assignments  — 전체 투입현황 (선택적 필터)
router.get('/', async (req, res, next) => {
  try {
    const { employee_id, project_id, current_only } = req.query;

    let query = db('assignments')
      .join('employees', 'assignments.employee_id', 'employees.id')
      .join('projects', 'assignments.project_id', 'projects.id')
      .select(
        'assignments.id',
        'assignments.role',
        'assignments.rate_pct',
        'assignments.start_date',
        'assignments.end_date',
        'employees.id as employee_id',
        'employees.name as employee_name',
        'employees.department',
        'projects.id as project_id',
        'projects.name as project_name',
        'projects.client',
        db.raw(
          `(assignments.start_date <= CURRENT_DATE AND (assignments.end_date IS NULL OR assignments.end_date >= CURRENT_DATE)) as is_current`,
        ),
      )
      .orderBy('assignments.start_date', 'desc');

    if (employee_id) query = query.where('assignments.employee_id', employee_id);
    if (project_id) query = query.where('assignments.project_id', project_id);
    if (current_only === 'true') {
      query = query
        .where('assignments.start_date', '<=', db.raw('CURRENT_DATE'))
        .where(function () {
          this.whereNull('assignments.end_date').orWhere(
            'assignments.end_date',
            '>=',
            db.raw('CURRENT_DATE'),
          );
        });
    }

    const data = await query;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/assignments  — 투입 등록 (단일 또는 다중 employee_id 지원)
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, project_id, role, rate_pct = 100, start_date, end_date } = req.body;

    if (!employee_id || !project_id || !start_date) {
      return res.status(400).json({
        success: false,
        message: '직원, 프로젝트, 투입 시작일은 필수입니다.',
      });
    }

    const employeeIds = Array.isArray(employee_id) ? employee_id : [employee_id];
    const rows = employeeIds.map((eid) => ({
      employee_id: eid,
      project_id,
      role,
      rate_pct,
      start_date,
      end_date,
    }));

    const assignments = await db('assignments').insert(rows).returning('*');

    res.status(201).json({ success: true, data: assignments });
  } catch (err) {
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
router.delete('/:id', async (req, res, next) => {
  try {
    const [assignment] = await db('assignments')
      .where({ id: req.params.id })
      .update({ end_date: db.raw('CURRENT_DATE'), updated_at: db.raw('NOW()') })
      .returning('id');

    if (!assignment) {
      return res.status(404).json({ success: false, message: '투입 정보를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '철수 처리되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
