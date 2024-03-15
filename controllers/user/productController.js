const SITE_TITLE = 'Dunamis';
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const User = require('../../models/user');
module.exports.index = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    const products = await Product.find();
    res.render('products', {
        site_title: SITE_TITLE,
        title: 'Shop',
        products: products,
        req: req,
        messages: req.flash(),
        cart:cart,
        userLogin:userLogin,
        currentUrl: req.originalUrl,
    });
}
module.exports.detail = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.render('product-detail', {
        site_title: SITE_TITLE,
        title: 'Detail',
        product: product,
        req: req,
        messages: req.flash(),
        userLogin:userLogin,
        cart:cart,
        currentUrl: req.originalUrl,
    });
}
module.exports.indexCategory = async (req, res) => {
    const category = req.params.category;
    const products = await Product.find();
    const productCategory = await Product.find({category: category});
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    res.render('productsCategory', {
        site_title: SITE_TITLE,
        title: 'Category',
        products: products,
        productCategory:productCategory,
        req: req,
        messages: req.flash(),
        cart:cart,
        userLogin:userLogin,
        currentUrl: req.originalUrl,
    });
}