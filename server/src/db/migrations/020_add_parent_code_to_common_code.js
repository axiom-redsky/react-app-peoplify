exports.up = async function (knex) {
	const has = await knex.schema.hasColumn('common_code', 'parent_code');
	if (!has) {
		await knex.schema.alterTable('common_code', (table) => {
			table.string('parent_code', 50).nullable();
		});
	}
};
exports.down = async function (knex) {
	const has = await knex.schema.hasColumn('common_code', 'parent_code');
	if (has) {
		await knex.schema.alterTable('common_code', (table) => {
			table.dropColumn('parent_code');
		});
	}
};
