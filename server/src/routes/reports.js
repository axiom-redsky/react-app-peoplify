const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// 대상 월의 시작/종료일을 구한다. year/month 미지정 시 이번 달 기준.
function resolveMonthRange(year, month) {
  const now = new Date();
  const y = Number(year) || now.getFullYear();
  const m = Number(month) || now.getMonth() + 1; // 1~12
  const monthStart = `${y}-${String(m).padStart(2, '0')}-01`;
  // 해당 월의 마지막 날 = 다음 달 0일
  const lastDay = new Date(y, m, 0).getDate();
  const monthEnd = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { year: y, month: m, monthStart, monthEnd };
}

// ── GET /api/reports/project-deployment ─────────────────────────────────────
// 프로젝트별 투입 인원. 대상 월(기본: 이번 달)에 투입이 겹친 인원 수를 집계.
// Query: year, month (선택)
router.get('/project-deployment', async (req, res, next) => {
  try {
    const { year, month, monthStart, monthEnd } = resolveMonthRange(
      req.query.year,
      req.query.month,
    );

    const rows = await db('projects')
      .leftJoin('assignments', function () {
        this.on('projects.id', 'assignments.project_id')
          .andOnVal('assignments.start_date', '<=', monthEnd)
          .andOn(function () {
            this.onNull('assignments.end_date').orOnVal(
              'assignments.end_date',
              '>=',
              monthStart,
            );
          });
      })
      .groupBy('projects.id')
      .select(
        'projects.id',
        'projects.name',
        'projects.status',
        db.raw('COUNT(DISTINCT assignments.employee_id)::int as deployed_count'),
      )
      .orderBy('projects.start_date');

    res.json({ success: true, data: { year, month, projects: rows } });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/reports/deployment-trend ───────────────────────────────────────
// 월별 투입률 추이. 각 달에 투입이 겹친 직원 수 / 재직 직원 수 * 100.
// Query: months (기본 6) — 이번 달 포함 직전 N개월
router.get('/deployment-trend', async (req, res, next) => {
  try {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    const result = await db.raw(
      `
      WITH month_series AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - make_interval(months => ? - 1),
          date_trunc('month', CURRENT_DATE),
          INTERVAL '1 month'
        )::date AS month_start
      ),
      active_total AS (
        SELECT COUNT(*)::int AS total
        FROM employees
        WHERE employment_status = 'active'
      )
      SELECT
        EXTRACT(YEAR FROM ms.month_start)::int  AS year,
        EXTRACT(MONTH FROM ms.month_start)::int AS month,
        COUNT(DISTINCT a.employee_id)::int      AS deployed,
        at.total                                AS total,
        CASE WHEN at.total > 0
          THEN ROUND(COUNT(DISTINCT a.employee_id)::numeric / at.total * 100)::int
          ELSE 0
        END                                     AS rate
      FROM month_series ms
      CROSS JOIN active_total at
      LEFT JOIN assignments a
        ON a.start_date <= (ms.month_start + INTERVAL '1 month - 1 day')::date
        AND (a.end_date IS NULL OR a.end_date >= ms.month_start)
      GROUP BY ms.month_start, at.total
      ORDER BY ms.month_start
      `,
      [months],
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/reports/member-summary ─────────────────────────────────────────
// 개인별 투입 요약. 재직 직원 전체 + 현재 투입 정보(투입률 높은 건 우선).
// 현재 투입이 없으면 status: 'bench'.
router.get('/member-summary', async (req, res, next) => {
  try {
    const result = await db.raw(
      `
      SELECT DISTINCT ON (e.id)
        e.id          AS employee_id,
        e.name        AS employee_name,
        e.department,
        p.name        AS project_name,
        a.role,
        a.rate_pct,
        a.start_date,
        a.end_date,
        CASE WHEN a.id IS NULL THEN 'bench' ELSE 'deployed' END AS status
      FROM employees e
      LEFT JOIN assignments a
        ON a.employee_id = e.id
        AND a.start_date <= CURRENT_DATE
        AND (a.end_date IS NULL OR a.end_date >= CURRENT_DATE)
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE e.employment_status = 'active'
      ORDER BY e.id, a.rate_pct DESC NULLS LAST, a.start_date DESC
      `,
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
