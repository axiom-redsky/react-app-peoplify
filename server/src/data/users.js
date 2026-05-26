const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    email: 'admin@peoplify.com',
    passwordHash: bcrypt.hashSync('password', 10),
    name: '관리자',
    role: 'admin',
  },
  {
    id: 2,
    email: 'user@peoplify.com',
    passwordHash: bcrypt.hashSync('password', 10),
    name: '일반사용자',
    role: 'user',
  },
];

function findByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

function findById(id) {
  return users.find((u) => u.id === id) || null;
}

module.exports = { findByEmail, findById };
