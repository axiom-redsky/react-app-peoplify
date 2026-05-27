const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  await knex('users').del();
  await knex('users').insert([
    {
      email: 'admin@peoplify.com',
      password_hash: bcrypt.hashSync('password', 10),
      name: '관리자',
      role: 'admin',
    },
    {
      email: 'user@peoplify.com',
      password_hash: bcrypt.hashSync('password', 10),
      name: '일반사용자',
      role: 'user',
    },
  ]);
};
