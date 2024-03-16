const User = require('../../models/user');
const SITE_TITLE = 'Dunamis';
const Enrollement = require('../../models/enrollment');
const Course = require('../../models/course');
const Order = require('../../models/order');
const Product = require('../../models/product');

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const enrollements = await Enrollement.find({isApproved: true});
            const courses = await Course.find();
            const users = await User.find();
            const products = await Product.find();
            const orders = await Order.find();
            let totalItemsOrdered = 0;

            orders.forEach(order => {
                order.items.forEach(item => {
                    totalItemsOrdered += item.quantity;
                });
            });
            res.render('admin/index', {
                site_title: SITE_TITLE,
                title: 'Dashboard',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                currentUrl: req.originalUrl,
                enrollements: enrollements,
                courses: courses,
                users: users,
                products: products,
                totalItemsOrdered: totalItemsOrdered,
            })
        } else {
            return res.status(404).render('404', { userLogin: userLogin })
        }
    } else {
        return res.redirect('/login');
    }
}