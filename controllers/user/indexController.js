const SITE_TITLE = 'Dunamis';
const Course = require('../../models/course');
const Enroll = require('../../models/enrollment');
const User = require('../../models/user');
const Cart = require('../../models/cart');


module.exports.index = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
        res.render('index', {
            site_title: SITE_TITLE,
            title: 'Home',
            req: req,
            messages: req.flash(),
            cart: cart,
            userLogin: userLogin,
            currentUrl: req.originalUrl,
        })
}