const Cart = require('../../models/cart');
const User = require('../../models/user');
const Product = require('../../models/product');


module.exports.addCart = async (req, res) => {
    const productId = req.body.productId;

    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            let cart = await Cart.findOne({ userId: req.session.login });

            if (!cart) {
                cart = new Cart({ userId: req.session.login, items: [] });
            }

            // Check if the product is already in the cart
            const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (existingItemIndex !== -1) {
                // If the product is already in the cart, redirect with a message
                req.flash('message', 'Item is already in the cart.');
                return res.redirect('/products');
            } else {
                // If the product is not in the cart, add it with quantity 1
                cart.items.push({ productId, quantity: 1 });
            }

            await cart.save();
            console.log('Product added to cart:', productId);
            res.redirect('/products');
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.addCartSingle = async (req, res) => {
    const productId = req.body.productId;
    const requestedQuantity = parseInt(req.body.quantity);
    const product = await Product.findById(productId)
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (product.quantity < requestedQuantity) {
                req.flash('message', 'Quantity exceeds available stock.');
                return res.redirect(`/product/detail/${productId}`);
            }
            let cart = await Cart.findOne({ userId: req.session.login });

            if (!cart) {
                cart = new Cart({ userId: req.session.login, items: [] });
            }

            // Check if the product is already in the cart
            const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (existingItemIndex !== -1) {
                // If the product is already in the cart, update the quantity
                cart.items[existingItemIndex].quantity = requestedQuantity;
            } else {
                // If the product is not in the cart, add it with the specified quantity
                cart.items.push({ productId, quantity: requestedQuantity });
            }

            await cart.save();
            console.log('Product added to cart:', productId, 'Quantity:', requestedQuantity);
            res.redirect(`/product/detail/${productId}`);
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};