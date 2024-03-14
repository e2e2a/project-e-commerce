const SITE_TITLE = 'Shope';
const Product = require('../../models/product');
module.exports.index = async (req, res) => {
    const products = await Product.find();
    res.render('products', {
        site_title: SITE_TITLE,
        title: 'Shop',
        products: products,
        req: req
    });
}
module.exports.detail = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.render('product-detail', {
        site_title: SITE_TITLE,
        title: 'Detail',
        product: product,
        req: req
    });
}
module.exports.indexCategory = async (req, res) => {
    const category = req.params.category;
    const products = await Product.find();
    const productCategory = await Product.find({category: category});
    res.render('productsCategory', {
        site_title: SITE_TITLE,
        title: 'Category',
        products: products,
        productCategory:productCategory,
        req: req
    });
}