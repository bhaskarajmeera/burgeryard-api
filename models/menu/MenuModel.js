const MenuSchema = require('./MenuSchema');

const getAvailableMenuItems = () => MenuSchema.find({ available: true }).sort({ category: 1, name: 1 }).lean();
const getAllMenuItems = () => MenuSchema.find().sort({ category: 1, name: 1 }).lean();
const insertMenuItem = (item) => MenuSchema.create(item);
const updateMenuItem = (itemId, item) => MenuSchema.findByIdAndUpdate(itemId, { $set: item }, { returnDocument: 'after', runValidators: true }).lean();
const deleteMenuItem = (itemId) => MenuSchema.findByIdAndDelete(itemId);

module.exports = { getAvailableMenuItems, getAllMenuItems, insertMenuItem, updateMenuItem, deleteMenuItem };
