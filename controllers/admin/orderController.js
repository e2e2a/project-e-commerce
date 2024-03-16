// controllers/orderController.js
const Order = require('../../models/order');
const SITE_TITLE = 'Dunamis';

module.exports.displayOrders = async (req, res) => {
    try {
        // Find all orders and populate user and product information
        const orders = await Order.find()
            .populate('userId')
            .populate('items.productId');

        // Render the order view with the orders data
        res.render('admin/orderView', { orders: orders });
    } catch (err) {
        console.error(err);
        console.log('hello')
        res.status(500).send('Server Error');
    }
};
