const UserSchema = require('./UserSchema');

const insertUser = (userObj) => UserSchema(userObj).save();

const getUserByEmail = (email) => UserSchema.findOne({ email: email.toLowerCase() });
const updateUserDetails = (userId, details) =>
	UserSchema.findByIdAndUpdate(userId, { $set: details }, { new: true });

module.exports = { getUserByEmail, insertUser, updateUserDetails };