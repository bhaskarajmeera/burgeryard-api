const OrderSchema = require('./OrderSchema');

const insertOrder = (orderObj) => OrderSchema.create(orderObj);
const getOrdersByUserId = (userId) => OrderSchema.find({ userId }).sort({ createdAt: -1 }).lean();

module.exports = { insertOrder, getOrdersByUserId };
