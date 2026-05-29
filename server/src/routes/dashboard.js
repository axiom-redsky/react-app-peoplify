const express = require('express');
const db = require('../db/knex');

const router = express.Router();

// 현재 투입 조건을 WHERE 절에 추가하는 헬퍼
// is_current = start_date <= TODAY AND (end_date IS NULL OR end_date >= TODAY)
function whereIsCurrent(qb, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return qb
    .where(`${prefix}start_date`, '<=', db.raw('CURRENT_DATE'))
    .where(function () {
      this.whereNull(`${prefix}end_date`).orWhere(`${prefix}end_date`, '>=', db.raw('CURRENT_DATE'));
    });
}

// ── GET /api/dashboard/summary ──────────────────────────────────────────────
// KPI 4종: 총 인원, 투입 중, 벤치, 진행 프로젝트
router.get('/summary', async (req, res, next) => {
  try {
    const [{ count: totalEmployees }] = await db('employees')
      .count('id')
      .where('employment_status', 'active');

    const [{ count: deployed }] = await whereIsCurrent(
      db('assignments').countDistinct('employee_id'),
      'assignments',
    );

    const bench = Math.max(0, Number(totalEmployees) - Number(deployed));

    const [{ count: activeProjects }] = await db('projects')
      .count('id')
      .where('status', 'active');

    res.json({
      success: true,
      data: {
        totalEmployees: Number(totalEmployees),
        deployed: Number(deployed),
        bench,
        activeProjects: Number(activeProjects),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/active-projects ──────────────────────────────────────
// 진행 프로젝트 목록 + 투입인원수 + 기술스택
router.get('/active-projects', async (req, res, next) => {
  try {
    const projects = await db('projects')
      .leftJoin('assignments', function () {
        this.on('projects.id', 'assignments.project_id')
          .andOnVal('assignments.start_date', '<=', db.raw('CURRENT_DATE'))
          .andOn(function () {
            this.onNull('assignments.end_date').orOnVal(
              'assignments.end_date',
              '>=',
              db.raw('CURRENT_DATE'),
            );
          });
      })
      .leftJoin('project_tech_stack', 'projects.id', 'project_tech_stack.project_id')
      .where('projects.status', 'active')
      .groupBy('projects.id')
      .select(
        'projects.id',
        'projects.name',
        'projects.client',
        'projects.start_date',
        'projects.end_date',
        'projects.status',
        'projects.progress_pct',
        db.raw('COUNT(DISTINCT assignments.employee_id) as deployed_count'),
        db.raw("ARRAY_REMOVE(ARRAY_AGG(DISTINCT project_tech_stack.tech), NULL) as tech_stack"),
      )
      .orderBy('projects.start_date');

    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/bench-members ────────────────────────────────────────
// 현재 투입 중인 assignment가 없는 active 직원
router.get('/bench-members', async (req, res, next) => {
  try {
    const currentlyDeployedIds = db('assignments')
      .select('employee_id')
      .where('start_date', '<=', db.raw('CURRENT_DATE'))
      .where(function () {
        this.whereNull('end_date').orWhere('end_date', '>=', db.raw('CURRENT_DATE'));
      });

    const benchEmployees = await db('employees')
      .leftJoin('employee_skills', 'employees.id', 'employee_skills.employee_id')
      .whereNotIn('employees.id', currentlyDeployedIds)
      .where('employees.employment_status', 'active')
      .groupBy('employees.id')
      .select(
        'employees.id',
        'employees.name',
        'employees.department',
        'employees.position',
        'employees.hire_date',
        db.raw("ARRAY_REMOVE(ARRAY_AGG(DISTINCT employee_skills.skill), NULL) as skills"),
      )
      .orderBy('employees.name');

    res.json({ success: true, data: benchEmployees });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/urgent-withdrawals ───────────────────────────────────
// 30일 내 철수 예정 (현재 투입 중 & end_date <= TODAY + 30일)
router.get('/urgent-withdrawals', async (req, res, next) => {
  try {
    const rows = await db('assignments')
      .join('employees', 'assignments.employee_id', 'employees.id')
      .join('projects', 'assignments.project_id', 'projects.id')
      .where('assignments.start_date', '<=', db.raw('CURRENT_DATE'))
      .where(function () {
        this.whereNull('assignments.end_date').orWhere(
          'assignments.end_date',
          '>=',
          db.raw('CURRENT_DATE'),
        );
      })
      .whereNotNull('assignments.end_date')
      .whereRaw("assignments.end_date <= CURRENT_DATE + INTERVAL '30 days'")
      .select(
        'employees.id as employee_id',
        'employees.name as employee_name',
        'employees.department',
        'projects.name as project_name',
        'assignments.end_date',
        db.raw('assignments.end_date - CURRENT_DATE as days_remaining'),
      )
      .orderBy('assignments.end_date');

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
