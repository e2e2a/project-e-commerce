const SITE_TITLE = 'Dunamis';
const multer = require('multer');
const Product = require('../../models/product');
const User = require('../../models/user');
var fileUpload = require('../../middlewares/product-upload-middleware');

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const products = await Product.find();
            res.render('admin/productView', {
                site_title: SITE_TITLE,
                title: 'Product',
                products: products,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            });
        } else {
            return res.status(404).render('404',{userLogin:userLogin});
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.create = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            res.render('admin/productCreate', {
                site_title: SITE_TITLE,
                title: 'Create',
                req: req,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            })
        } else {
            return res.status(404).render('404',{userLogin:userLogin});
        }
    } else {
        return res.redirect('/login');
    }
};

module.exports.doCreate = (request, response) => {
    var upload = multer({
        storage: fileUpload.files.storage(),
        allowedFile: fileUpload.files.allowedFile
    }).single('image');
    upload(request, response, async function (err) {
        if (err instanceof multer.MulterError) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else if (err) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else {
            const imageUrlExist = await Product.findOne({ imageURL: `/public/uploads/product/${request.file.filename}` });
            if (imageUrlExist) {
                request.flash('message', 'Product image is in used');
                return response.redirect('/admin/product/create')
            }
            const product = new Product({
                name: request.body.name,
                price: request.body.price,
                category: request.body.category,
                brand: request.body.brand,
                color: request.body.color,
                quantity: request.body.quantity,
                description: request.body.description,
            });
            product.save().then(async () => {
                product.imageURL = `/public/uploads/product/${request.file.filename}`;
                await product.save();
                console.log('success')
                request.flash('message', 'Product Created.')
                return response.redirect('/admin/product');
            }, (err) => {
                return response
                    .status(err.status || 500)
                    .render('500', { err: err });
            });
        }
    });
}

module.exports.delete = async (req, res) => {
    const productId = req.body.productId;
    const productToDelete = await Product.findByIdAndDelete(productId);
    if (productToDelete) {
        console.log('product Deleted');
        req.flash('message', 'Product Deleted!');
        return res.redirect('/admin/product');
    } else {
        console.log('failed product Deleted');
        req.flash('message', 'Product Deleted Failed!');
        return res.redirect('/admin/product');
    }
}

module.exports.edit = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            try {
                const productId = req.params.productId
                const product = await Product.findById(productId)
                res.render('admin/productEdit', {
                    site_title: SITE_TITLE,
                    title: 'Product Update',
                    product: product,
                    messages: req.flash(),
                    userLogin: userLogin,
                    currentUrl: req.originalUrl,
                });
            } catch (err) {
                return res
                    .status(err.status || 500)
                    .render('500', { err: err });
            }
        } else {
            return res.status(404).render('404',{userLogin:userLogin});
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.doEdit = async (request, response) => {
    const productId = request.params.productId;
    const product = await Product.findById(productId);
    var upload = multer({
        storage: fileUpload.files.storage(),
        allowedFile: fileUpload.files.allowedFile
    }).single('image');
    upload(request, response, async function (err) {
        if (err instanceof multer.MulterError) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else if (err) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else {
            let imageUrl = '';
            if (product.imageURL) {
                imageUrl = product.imageURL;
            }
            if (request.file) {
                imageUrl = `/public/uploads/product/${request.file.filename}`;
                const imageUrlExist = await Product.findOne({ imageURL: `/public/uploads/product/${request.file.filename}` });
                if (imageUrlExist) {
                    request.flash('message', 'Product image is in used');
                    return response.redirect(`/admin/product/edit/${product._id}`)
                }
            }
            const productData = {
                name: request.body.name,
                price: request.body.price,
                category: request.body.category,
                brand: request.body.brand,
                color: request.body.color,
                imageURL: imageUrl,
                quantity: request.body.quantity,
                description: request.body.description,
            };
            const updatedProduct = await Product.findByIdAndUpdate(productId, productData, {
                new: true
            })
            if (updatedProduct) {
                console.log('success update');
                request.flash('message', 'Product Updated');
                return response.redirect('/admin/product');
            } else {
                return response
                    .status(404)
                    .render('404', { err: err });
            }
        }
    });
}