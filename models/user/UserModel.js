const UserSchema = require('./UserSchema');

const insertUser = (userObj) => UserSchema(userObj).save();

const getUserByEmail = (email) => UserSchema.findOne({ email: email.toLowerCase() });
const updateUserDetails = (userId, details) =>
	UserSchema.findByIdAndUpdate(userId, { $set: details }, { new: true, runValidators: true });
const createOAuthUser = async ({ provider, providerId, email, name }) =>
	UserSchema.findOneAndUpdate(
		{ authProvider: provider, providerId },
		{ $set: { email: email.toLowerCase(), name, authProvider: provider, providerId } },
		{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
	);

module.exports = { getUserByEmail, insertUser, updateUserDetails, createOAuthUser };