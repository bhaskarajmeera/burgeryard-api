const OrderSchema = require('./OrderSchema');

const insertOrder = (orderObj) => OrderSchema.create(orderObj);
const getOrdersByUserId = (userId) => OrderSchema.find({ userId }).sort({ createdAt: -1 }).lean();
const updatePaymentStatusByIntent = (paymentIntentId, paymentStatus) =>
	OrderSchema.findOneAndUpdate({ paymentIntentId }, { $set: { paymentStatus } }, { new: true });

module.exports = { insertOrder, getOrdersByUserId, updatePaymentStatusByIntent };
