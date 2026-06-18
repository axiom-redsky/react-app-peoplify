/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * assignments 테이블에 계약정보 표시용 컬럼 추가
 *
 * 기존 start_date / end_date:
 * - 실제 프로젝트 투입 시작일 / 종료일
 *
 * contract_start_date / contract_end_date:
 * - 계약 시작일 / 종료일
 *
 * total_amount:
 * - 계약금액
 *
 * performance_rating:
 * - 수행평가
 * - excellent: 우수
 * - good: 양호
 * - normal: 보통
 * - poor: 미흡
 */
exports.up = function (knex) {
	return knex.schema.alterTable('assignments', (table) => {
		table.date('contract_start_date').nullable();
		table.date('contract_end_date').nullable();
		table.bigInteger('total_amount').nullable();
		table.string('performance_rating', 20).nullable();
	});
};

exports.down = function (knex) {
	return knex.schema.alterTable('assignments', (table) => {
		table.dropColumn('performance_rating');
		table.dropColumn('total_amount');
		table.dropColumn('contract_end_date');
		table.dropColumn('contract_start_date');
	});
};