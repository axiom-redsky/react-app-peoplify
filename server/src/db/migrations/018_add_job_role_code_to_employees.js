/**
 * 003_add_job_role_code_to_employees.js
 *
 * employees 테이블에 직군/업무역할 코드 컬럼 추가
 */

exports.up = async function (knex) {
	const hasColumn = await knex.schema.hasColumn('employees', 'job_role_code');
	if (!hasColumn) {
		await knex.schema.alterTable('employees', (table) => {
			table.string('job_role_code', 50).nullable();
			table.index(['job_role_code'], 'employees_job_role_code_idx');
		});
	}
};

exports.down = async function (knex) {
	const hasColumn = await knex.schema.hasColumn('employees', 'job_role_code');
	if (hasColumn) {
		await knex.schema.alterTable('employees', (table) => {
			table.dropIndex(['job_role_code'], 'employees_job_role_code_idx');
			table.dropColumn('job_role_code');
		});
	}
};
