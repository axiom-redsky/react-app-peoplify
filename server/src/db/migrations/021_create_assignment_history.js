exports.up = function (knex) {
	return knex.schema.createTable('assignment_history', (table) => {
		table.increments('id').primary();

		// 원본 투입 ID
		// assignments에서 삭제되어도 이력은 남아야 하므로 SET NULL
		table
			.integer('assignment_id')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('assignments')
			.onDelete('SET NULL');

		// 직원 ID
		// employees에서 삭제되어도 이력은 남아야 하므로 SET NULL
		table
			.integer('employee_id')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('employees')
			.onDelete('SET NULL');

		// 프로젝트 ID
		// projects에서 삭제되어도 이력은 남아야 하므로 SET NULL
		table
			.integer('project_id')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('projects')
			.onDelete('SET NULL');

		// 직원 정보 스냅샷
		// 직원 테이블 현재값에 의존하지 않고 당시 표시값을 보존하기 위한 컬럼
		table.string('employee_name', 100).notNullable();
		table.string('department', 100);
		table.string('position', 100);

		// 프로젝트 정보 스냅샷
		// 프로젝트 테이블 현재값에 의존하지 않고 당시 표시값을 보존하기 위한 컬럼
		table.string('project_name', 255).notNullable();
		table.string('client', 255);

		// 투입 정보 스냅샷
		table.string('role', 100);
		table.integer('rate_pct').defaultTo(100);
		table.date('start_date').notNullable();
		table.date('end_date');

		// 이력 구분값
		// ASSIGNED: 투입
		// UPDATED: 수정
		// REMOVED: 제외
		// ENDED: 종료
		table.string('action_type', 30).notNullable().defaultTo('ASSIGNED');

		// 화면 표시용 상태
		// SCHEDULED: 예정
		// ACTIVE: 투입중
		// ENDED: 종료
		// CANCELED: 취소
		table.string('status', 30).notNullable().defaultTo('SCHEDULED');

		// 이력 생성 시점
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

		// 이력 테이블은 기본적으로 누적 저장용이므로 수정 시점은 nullable 처리
		table.timestamp('updated_at').nullable();

		// 조회 성능용 인덱스
		table.index(['assignment_id']);
		table.index(['employee_id']);
		table.index(['project_id']);
		table.index(['employee_id', 'start_date']);
		table.index(['project_id', 'start_date']);
		table.index(['action_type']);
		table.index(['status']);
	});
};

exports.down = function (knex) {
	return knex.schema.dropTableIfExists('assignment_history');
};