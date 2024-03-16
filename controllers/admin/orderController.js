// controllers/orderController.js
const Order = require('../../models/order');
const User = require('../../models/user');
const SITE_TITLE = 'Dunamis';

module.exports.displayOrders = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            try {
                const orders = await Order.find()
                    .populate('userId')
                    .populate('items.productId');

                res.render('admin/orderView', {
                    site_title: SITE_TITLE,
                    title: 'Orders Checkout',
                    orders: orders,
                    messages: req.flash(),
                    currentUrl: req.originalUrl,
                    userLogin: userLogin,
                });
            } catch (err) {
                console.error(err);
                console.log('hello')
                res.status(500).send('Server Error');
            }
        } else {
            return res.status(404).render('404',{userLogin:userLogin});
        }
    } else {
        return res.redirect('/login');
    }
};
