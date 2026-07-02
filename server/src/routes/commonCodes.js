const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// 코드 상세 조회용 컬럼 (생성/수정 시점 메타 제외 가능하나 일관성 위해 전체 반환)
const CODE_COLUMNS = [
  'id',
  'group_code',
  'code',
  'code_name',
  'sort_order',
  'use_yn',
  'extra1',
  'extra2',
  'extra3',
	'parent_code',
];

// ─────────────────────────────────────────────────────────────────────────────
// 코드그룹 (Code Group) — 관리용
// ⚠ '/groups' 경로는 '/:groupCode' 보다 먼저 정의해야 한다.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/common-codes/groups  — 코드그룹 목록
router.get('/groups', async (_req, res, next) => {
  try {
    const data = await db('common_code_group').orderBy('group_code');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/common-codes/groups  — 코드그룹 등록
router.post('/groups', async (req, res, next) => {
  try {
    const { group_code, group_name, description, use_yn = true } = req.body;

    if (!group_code || !group_name) {
      return res.status(400).json({ success: false, message: 'group_code, group_name은 필수입니다.' });
    }

    const [group] = await db('common_code_group')
      .insert({ group_code, group_name, description, use_yn })
      .returning('*');

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: '이미 존재하는 group_code입니다.' });
    }
    next(err);
  }
});

// PUT /api/common-codes/groups/:groupCode  — 코드그룹 수정
router.put('/groups/:groupCode', async (req, res, next) => {
  try {
    const { group_name, description, use_yn } = req.body;

    const [group] = await db('common_code_group')
      .where({ group_code: req.params.groupCode })
      .update({ group_name, description, use_yn, updated_at: db.raw('NOW()') })
      .returning('*');

    if (!group) {
      return res.status(404).json({ success: false, message: '코드그룹을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/common-codes/groups/:groupCode  — 코드그룹 삭제 (하위 코드 CASCADE)
router.delete('/groups/:groupCode', async (req, res, next) => {
  try {
    const deleted = await db('common_code_group')
      .where({ group_code: req.params.groupCode })
      .del();

    if (!deleted) {
      return res.status(404).json({ success: false, message: '코드그룹을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '코드그룹이 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 코드 조회 (Lookup)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/common-codes            — 전체(또는 ?groups=A,B) 그룹별 코드 묶음 조회
// GET /api/common-codes?groups=A,B — 지정 그룹만
//   응답: { "EMPLOYMENT_STATUS": [...], "LEAVE_TYPE": [...] }
//   기본적으로 use_yn=true 만 반환 (?include_disabled=true 면 전체)
router.get('/', async (req, res, next) => {
  try {
    const { groups, include_disabled } = req.query;

    let query = db('common_code').select(CODE_COLUMNS).orderBy([
      { column: 'group_code', order: 'asc' },
      { column: 'sort_order', order: 'asc' },
    ]);

    if (include_disabled !== 'true') query = query.where('use_yn', true);
    if (groups) {
      const groupList = String(groups).split(',').map((g) => g.trim()).filter(Boolean);
      query = query.whereIn('group_code', groupList);
    }

    const rows = await query;
    const data = rows.reduce((acc, row) => {
      (acc[row.group_code] ??= []).push(row);
      return acc;
    }, {});

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/common-codes/:groupCode  — 단일 그룹의 코드 배열
//   기본 use_yn=true 만, ?include_disabled=true 면 전체
router.get('/:groupCode', async (req, res, next) => {
  try {
    const group = await db('common_code_group')
      .where({ group_code: req.params.groupCode })
      .first();
    if (!group) {
      return res.status(404).json({ success: false, message: '코드그룹을 찾을 수 없습니다.' });
    }

    let query = db('common_code')
      .select(CODE_COLUMNS)
      .where({ group_code: req.params.groupCode })
      .orderBy('sort_order');
    if (req.query.include_disabled !== 'true') query = query.where('use_yn', true);

    const data = await query;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 코드 상세 (Code) — 관리용
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/common-codes  — 코드 등록
router.post('/', async (req, res, next) => {
  try {
    const { group_code, code, code_name, sort_order = 0, use_yn = true, extra1, extra2, extra3 } = req.body;

    if (!group_code || !code || !code_name) {
      return res.status(400).json({ success: false, message: 'group_code, code, code_name은 필수입니다.' });
    }

    const group = await db('common_code_group').where({ group_code }).first();
    if (!group) {
      return res.status(400).json({ success: false, message: '존재하지 않는 group_code입니다.' });
    }

    const [created] = await db('common_code')
      .insert({ group_code, code, code_name, sort_order, use_yn, extra1, extra2, extra3 })
      .returning('*');

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: '해당 그룹에 이미 존재하는 code입니다.' });
    }
    next(err);
  }
});

// PUT /api/common-codes/:id  — 코드 수정 (code 상세 id 기준)
router.put('/:id', async (req, res, next) => {
  try {
    const { code, code_name, sort_order, use_yn, extra1, extra2, extra3 } = req.body;

    const [updated] = await db('common_code')
      .where({ id: req.params.id })
      .update({ code, code_name, sort_order, use_yn, extra1, extra2, extra3, updated_at: db.raw('NOW()') })
      .returning('*');

    if (!updated) {
      return res.status(404).json({ success: false, message: '코드를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: '해당 그룹에 이미 존재하는 code입니다.' });
    }
    next(err);
  }
});

// DELETE /api/common-codes/:id  — 코드 삭제
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await db('common_code').where({ id: req.params.id }).del();
    if (!deleted) {
      return res.status(404).json({ success: false, message: '코드를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '코드가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
