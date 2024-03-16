// controllers/orderController.js
const Order = require('../../models/order');

module.exports.displayOrders = async (req, res) => {
    try {
        // Find all orders and populate user and product information
        const orders = await Order.find()
            .populate('userId') // Populate the user
            .populate('items.productId'); // Populate the product for each item

        // Render the order view with the orders data
        res.render('admin/orderView', { orders: orders });
    } catch (err) {
        console.error(err);
        console.log('hello')
        res.status(500).send('Server Error');
    }
};
