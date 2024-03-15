const Cart = require('../../models/cart');
const User = require('../../models/user');
const Product = require('../../models/product');
const SITE_TITLE = 'Dunamis';
module.exports.cart = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if(userLogin){
        const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
        res.render('cart', {
            req: req,
            messages: req.flash(),
            currentUrl: req.originalUrl,
            cart: cart,
            currentUrl: req.originalUrl,
            userLogin: userLogin,
            SITE_TITLE:SITE_TITLE,
            title: 'Cart'
        });
    }else{
        return res.redirect('/login');
    }
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Internal Server Error');
    }
}


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

module.exports.updateCart = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const quantity = parseInt(req.body.qty);

        // Find the cart item by ID
        const cartItem = await Cart.findOne({ "items._id": itemId });

        // Find the product associated with the cart item
        const product = await Product.findById(cartItem.items.find(item => item._id == itemId).productId);

        // Check if the requested quantity exceeds the available stock
        if (product.quantity < quantity) {
            req.flash('message', 'Quantity exceeds available stock.');
            return res.redirect(`/carts`);
        }

        // Update the quantity of the cart item
        const updatedCartItem = await Cart.findOneAndUpdate(
            { "items._id": itemId },
            { $set: { "items.$.quantity": quantity } },
            { new: true }
        );

        // Calculate subtotal
        let subtotal = 0;
        updatedCartItem.items.forEach(item => {
            subtotal += item.productId.price * item.quantity;
        });

        // Redirect back to the product detail page
        console.log('Product in cart updated');
        req.flash('message', 'Cart updated');
        res.redirect(`/carts`);
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send('Internal Server Error');
    }
};