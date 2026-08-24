const UserSchema = require('./UserSchema');

const insertUser = (userObj) => UserSchema(userObj).save();

const getUserByEmail = (email) => UserSchema.findOne({ email: email.toLowerCase() });

module.exports = { insertUser, getUserByEmail };