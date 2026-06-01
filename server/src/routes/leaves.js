const express = require('express');
const db = require('../db/knex');

const router = express.Router();

const LEAVE_TYPES = ['annual', 'half_day_am', 'half_day_pm', 'sick', 'bereavement'];
// 연차 잔여 차감 대상 (병가/경조사 제외)
const ANNUAL_TYPES = ['annual', 'half_day_am', 'half_day_pm'];

// GET /api/leaves  — 특정 직원의 신청 내역 (최근순)
//   필수: employee_id / 선택: status, year
router.get('/', async (req, res, next) => {
  try {
    const { employee_id, status, year } = req.query;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id는 필수입니다.' });
    }

    let query = db('leaves').where('employee_id', employee_id).orderBy('start_date', 'desc');

    if (status) query = query.where('status', status);
    if (year) query = query.whereRaw('EXTRACT(YEAR FROM start_date) = ?', [year]);

    const data = await query;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaves/balance  — 연차 현황 (총부여/사용/잔여/신청중)
//   필수: employee_id / 선택: year (기본: 올해)
router.get('/balance', async (req, res, next) => {
  try {
    const { employee_id } = req.query;
    const year = req.query.year || new Date().getFullYear();

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id는 필수입니다.' });
    }

    const balance = await db('leave_balances').where({ employee_id, year }).first();
    const total = balance ? Number(balance.total_days) : 15;

    const [used] = await db('leaves')
      .where({ employee_id, status: 'approved' })
      .whereIn('type', ANNUAL_TYPES)
      .whereRaw('EXTRACT(YEAR FROM start_date) = ?', [year])
      .sum('days as total');

    const [pending] = await db('leaves')
      .where({ employee_id, status: 'pending' })
      .whereIn('type', ANNUAL_TYPES)
      .whereRaw('EXTRACT(YEAR FROM start_date) = ?', [year])
      .sum('days as total');

    const usedDays = Number(used.total) || 0;
    const pendingDays = Number(pending.total) || 0;

    res.json({
      success: true,
      data: {
        year: Number(year),
        total_days: total,
        used_days: usedDays,
        pending_days: pendingDays,
        remaining_days: total - usedDays,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/leaves  — 휴가 신청
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, type, start_date, end_date, days, reason } = req.body;

    if (!employee_id || !type || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'employee_id, type, start_date는 필수입니다.',
      });
    }

    if (!LEAVE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type은 다음 중 하나여야 합니다: ${LEAVE_TYPES.join(', ')}`,
      });
    }

    const end = end_date || start_date;
    // days 미입력 시 반차는 0.5, 그 외는 기간(일) 자동 계산
    let resolvedDays = days;
    if (resolvedDays === undefined) {
      if (type === 'half_day_am' || type === 'half_day_pm') {
        resolvedDays = 0.5;
      } else {
        const diff = (new Date(end) - new Date(start_date)) / (1000 * 60 * 60 * 24);
        resolvedDays = diff + 1;
      }
    }

    const [leave] = await db('leaves')
      .insert({
        employee_id,
        type,
        start_date,
        end_date: end,
        days: resolvedDays,
        reason,
        status: 'pending',
      })
      .returning('*');

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leaves/:id/status  — 승인/반려 (Manager)
//   body: { status: 'approved' | 'rejected' }
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "status는 'approved' 또는 'rejected'여야 합니다." });
    }

    const [leave] = await db('leaves')
      .where({ id: req.params.id })
      .update({ status, updated_at: db.raw('NOW()') })
      .returning('*');

    if (!leave) {
      return res.status(404).json({ success: false, message: '휴가 신청을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leaves/:id  — 신청 취소 (대기 상태만 가능)
router.delete('/:id', async (req, res, next) => {
  try {
    const leave = await db('leaves').where({ id: req.params.id }).first();

    if (!leave) {
      return res.status(404).json({ success: false, message: '휴가 신청을 찾을 수 없습니다.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: '승인 대기 중인 신청만 취소할 수 있습니다.' });
    }

    await db('leaves').where({ id: req.params.id }).del();

    res.json({ success: true, message: '휴가 신청이 취소되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
