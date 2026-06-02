const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// GET /api/departments  — 부서 목록 (조직 마스터)
//   Query: use_yn ('true' 면 사용중만)
router.get('/', async (req, res, next) => {
  try {
    const { use_yn } = req.query;

    let query = db('departments').orderBy([
      { column: 'sort_order', order: 'asc' },
      { column: 'id', order: 'asc' },
    ]);
    if (use_yn === 'true') query = query.where('use_yn', true);

    const data = await query;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/departments/:id  — 부서 상세 (+ 소속 직원 수)
router.get('/:id', async (req, res, next) => {
  try {
    const department = await db('departments').where({ id: req.params.id }).first();
    if (!department) {
      return res.status(404).json({ success: false, message: '부서를 찾을 수 없습니다.' });
    }

    const [{ count }] = await db('employees')
      .where({ department_id: department.id })
      .count('* as count');

    res.json({ success: true, data: { ...department, employee_count: Number(count) } });
  } catch (err) {
    next(err);
  }
});

// POST /api/departments  — 부서 등록
router.post('/', async (req, res, next) => {
  try {
    const { code, name, description, sort_order = 0, use_yn = true } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '부서명은 필수입니다.' });
    }

    const [department] = await db('departments')
      .insert({ code, name, description, sort_order, use_yn })
      .returning('*');

    res.status(201).json({ success: true, data: department });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: '이미 존재하는 부서 코드 또는 부서명입니다.' });
    }
    next(err);
  }
});

// PUT /api/departments/:id  — 부서 수정
router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, description, sort_order, use_yn } = req.body;

    const [department] = await db('departments')
      .where({ id: req.params.id })
      .update({ code, name, description, sort_order, use_yn, updated_at: db.raw('NOW()') })
      .returning('*');

    if (!department) {
      return res.status(404).json({ success: false, message: '부서를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: department });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: '이미 존재하는 부서 코드 또는 부서명입니다.' });
    }
    next(err);
  }
});

// DELETE /api/departments/:id  — 부서 삭제
//   소속 직원이 있으면 삭제 차단(무결성 보호). 재배정 후 삭제할 것.
router.delete('/:id', async (req, res, next) => {
  try {
    const [{ count }] = await db('employees')
      .where({ department_id: req.params.id })
      .count('* as count');

    if (Number(count) > 0) {
      return res.status(400).json({
        success: false,
        message: `해당 부서에 소속된 직원이 ${count}명 있어 삭제할 수 없습니다. 직원 부서를 먼저 재배정하세요.`,
      });
    }

    const deleted = await db('departments').where({ id: req.params.id }).del();
    if (!deleted) {
      return res.status(404).json({ success: false, message: '부서를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '부서가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
