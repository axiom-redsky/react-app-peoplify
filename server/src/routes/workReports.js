const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// GET /api/work-reports  — 특정 직원의 보고 이력 (최근순)
//   필수: employee_id
router.get('/', async (req, res, next) => {
  try {
    const { employee_id, year } = req.query;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id는 필수입니다.' });
    }

    let query = db('work_reports')
      .where('employee_id', employee_id)
      .orderBy([
        { column: 'year', order: 'desc' },
        { column: 'month', order: 'desc' },
      ]);

    if (year) query = query.where('year', year);

    const data = await query;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/work-reports/team  — 팀 보고 현황 (Manager 뷰)
//   재직(active) 직원 전체를 기준으로 해당 월 보고를 LEFT JOIN.
//   보고가 없으면 status='none'(미제출)으로 반환.
//   필수: year, month
router.get('/team', async (req, res, next) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year, month는 필수입니다.' });
    }

    const data = await db('employees')
      .leftJoin('work_reports', function () {
        this.on('work_reports.employee_id', '=', 'employees.id')
          .andOn('work_reports.year', '=', db.raw('?', [year]))
          .andOn('work_reports.month', '=', db.raw('?', [month]));
      })
      .where('employees.employment_status', 'active')
      .select(
        'employees.id as employee_id',
        'employees.name as employee_name',
        'employees.department',
        'work_reports.id as report_id',
        'work_reports.work_days',
        'work_reports.overtime_hours',
        db.raw("COALESCE(work_reports.status, 'none') as status"),
      )
      .orderBy('employees.id');

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/work-reports  — 보고 제출 (직원-연-월 기준 upsert)
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, year, month, work_days, overtime_hours = 0, note } = req.body;

    if (!employee_id || !year || !month || work_days === undefined) {
      return res.status(400).json({
        success: false,
        message: 'employee_id, year, month, work_days는 필수입니다.',
      });
    }

    const [report] = await db('work_reports')
      .insert({
        employee_id,
        year,
        month,
        work_days,
        overtime_hours,
        note,
        status: 'submitted',
        submitted_at: db.raw('NOW()'),
      })
      .onConflict(['employee_id', 'year', 'month'])
      .merge({
        work_days,
        overtime_hours,
        note,
        status: 'submitted',
        submitted_at: db.raw('NOW()'),
        approved_at: null,
        updated_at: db.raw('NOW()'),
      })
      .returning('*');

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/work-reports/:id/status  — 승인/반려 (Manager)
//   body: { status: 'approved' | 'submitted' }
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'submitted'].includes(status)) {
      return res.status(400).json({ success: false, message: "status는 'approved' 또는 'submitted'여야 합니다." });
    }

    const [report] = await db('work_reports')
      .where({ id: req.params.id })
      .update({
        status,
        approved_at: status === 'approved' ? db.raw('NOW()') : null,
        updated_at: db.raw('NOW()'),
      })
      .returning('*');

    if (!report) {
      return res.status(404).json({ success: false, message: '근무 보고를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// POST /api/work-reports/notify  — 미제출자 알림 발송 (데모: 대상자만 집계)
//   body: { year, month }
router.post('/notify', async (req, res, next) => {
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year, month는 필수입니다.' });
    }

    const submitted = db('work_reports')
      .where({ year, month })
      .select('employee_id');

    const pending = await db('employees')
      .where('employment_status', 'active')
      .whereNotIn('id', submitted)
      .select('id as employee_id', 'name as employee_name');

    res.json({
      success: true,
      message: `미제출자 ${pending.length}명에게 알림을 발송했습니다.`,
      data: pending,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
