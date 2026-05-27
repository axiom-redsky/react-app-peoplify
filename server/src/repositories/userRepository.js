const db = require('../db/knex');

exports.findByEmail = (email) => db('users').where({ email }).first();
exports.findById = (id) => db('users').where({ id }).first();
