const bcrypt = require('bcryptjs');

const hashPassword = (plainPassword) => bcrypt.hashSync(plainPassword, 10);

const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };