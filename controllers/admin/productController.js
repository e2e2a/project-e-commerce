const SITE_TITLE = 'Shope';
const multer = require('multer');
const Product = require('../../models/product');
var fileUpload = require('../../middlewares/product-upload-middleware');

module.exports.index = async (req, res) => {
    const products = await Product.find();
    if (req.session.login) {
        res.render('admin/productView', {
            site_title: SITE_TITLE,
            title: 'Product',
            products: products,
            messages: req.flash(),
        });
    } else {
        res.render('admin/productView', {
            site_title: SITE_TITLE,
            title: 'Product',
            products: products,
            messages: req.flash(),
        });
    }
}

module.exports.details = (request, response) => {
    if (request.session.userId) {
        response.redirect('product-details', {
            site_title: SITE_TITLE,
            title: 'Product-details',
            messages: req.flash(),
        });
    } else {
        response.render('product-details', {
            site_title: SITE_TITLE,
            title: 'Product-details',
            messages: req.flash(),
        });
    }
};

module.exports.create = (req, res) => {
    res.render('admin/productCreate', {
        req: req,
        messages: req.flash(),
    })
};

module.exports.doCreate = (request, response) => {
    var upload = multer({
        storage: fileUpload.files.storage(),
        allowedFile: fileUpload.files.allowedFile
    }).single('image');
    upload(request, response, function (err) {
        if (err instanceof multer.MulterError) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else if (err) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else {
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
                return response.redirect('/admin/product');
            }, (err) => {
                return response
                    .status(err.status || 500)
                    .render('500', { err: err });
            });
        }
    });
}

module.exports.update = async (request, response) => {
    const productId = request.params.productId
    if (request.session.userId) {
        response.redirect('product-update', {
            site_title: SITE_TITLE,
            title: 'Product Update',
            product: product,
            messages: req.flash(),
        });
    }
    try {
        const product = await Product.findById(productId).exec();

        if (product) {
            response.render('product-update', {
                site_title: SITE_TITLE,
                title: 'Product Update',
                product: product
            });
        } else {
            //redirect to 404 page
            return response
                .status(err.status || 404)
                .render('404', { err: err });
        }
    } catch (err) {
        //redirect to 500 page
        return response
            .status(err.status || 500)
            .render('500', { err: err });
    }
}
module.exports.doUpdate = (request, response) => {
    var upload = multer({
        storage: fileUpload.files.storage(),
        allowedFile: fileUpload.files.allowedFile
    }).single('image');
    upload(request, response, async function (err) {
        if (err instanceof multer.MulterError) {
            // Sending the multer error to the client
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else if (err) { // If there's another kind of error (not a MulterError), then handle it here
            // Sending the generic error to the client
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else { // If no errors occurred during the file upload, continue to the next step
            const imageUrl = `/public/uploads/${request.file.filename}`;
            const productId = request.params.productId
            try {
                // this is the new updated product properties
                const updatedData = {
                    name: request.body.name,
                    description: request.body.description,
                    price: request.body.price,
                    note: request.body.note,
                    category: request.body.category,
                    stockQuantity: request.body.stockQuantity,
                    imageURL: imageUrl,
                    isAvailable: request.body.isAvailable == 'on'
                };
                // functions both as find (productId) and update (updateData).
                const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, {
                    new: true  // This option returns the updated document
                })
                if (updatedProduct) {
                    // redirect back to the product page
                    response.redirect("/product/" + updatedProduct._id);
                } else {
                    // redirect to 404 error Page (product-404.ejs)
                    return response
                        .status(404)
                        .render('404', { err: err });
                }

            } catch (err) {
                console.log("Error!", err);
                // redirect to error Critical Error Page (error-500.ejs)
                return response
                    .status(err.status || 500)
                    .render('500', { err: err });
            }

        }
    });
}