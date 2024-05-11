const Cart = require('../../models/cart');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const nodemailer = require('nodemailer');
const qr = require('qrcode');
const SITE_TITLE = 'Dunamis';

module.exports.cart = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
            res.render('cart', {
                req: req,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                cart: cart,
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                site_title: SITE_TITLE,
                title: 'Cart'
            });
        } else {
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
    const actions = req.body.actions;
    if (actions === 'update') {
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
    } else if (actions === 'delete') {
        try {
            const itemId = req.body.itemId;
            // Find and remove the cart item by its ID
            const cartItem = await Cart.findOneAndUpdate(
                { "items._id": itemId },
                { $pull: { items: { _id: itemId } } },
                { new: true }
            );

            // Redirect back to the cart page
            console.log('Product removed from cart');
            req.flash('message', 'Product removed from cart');
            res.redirect(`/carts`);
        } catch (error) {
            console.error('Error deleting product from cart:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports.checkout = async (req, res) => {
    try {
        const checkbox = req.body.checkbox;
        if (checkbox === 'Gcash') {
            const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
            const userLogin = await User.findById(req.session.login);
            if (!userLogin) {
                return res.redirect('/login')
            }
            if(!cart || !cart.items.length > 0){
                return res.redirect('/')
            }

            const url = `https://dunamismusiccenter.onrender.com/qrcode/checkout?id=${userLogin._id}`;
            qr.toDataURL(url, (err, qrDataURL) => {
                if (err) {
                    console.error(err);
                    // Handle error appropriately
                    return res.status(500).send('Error generating QR code');
                }
                return res.render('qrcode', {
                    site_title: SITE_TITLE,
                    title: 'Qr Code',
                    req: req,
                    messages: req.flash(),
                    cart: cart,
                    userLogin: userLogin,
                    currentUrl: req.originalUrl,
                    qrCodeDataURL: qrDataURL // Pass the QR code data URL to the template
                });
            });
        } else if (checkbox === 'COD') {
            const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
            if (!cart) {
                return res.status(404).send('Cart not found');
            }

            // Calculate total amount based on items in the cart
            let totalAmount = 0;
            for (const item of cart.items) {
                if (item.productId && item.productId.price) {
                    totalAmount += item.productId.price * item.quantity;
                }
                // Update the quantity of the product item
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { quantity: -item.quantity }
                });
            }

            const orderItems = cart.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
            }));

            const order = new Order({
                userId: req.session.login,
                items: orderItems,
                totalAmount: totalAmount,
            });

            await order.save();
            await Cart.deleteOne({ _id: cart._id });
            const user = await User.findById(req.session.login)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'emonawong22@gmail.com',
                    pass: 'nouv heik zbln qkhf',
                },
            });
            const sendEmail = async (from, to, subject, htmlContent) => {
                try {
                    const mailOptions = {
                        from,
                        to,
                        subject,
                        html: htmlContent,
                    };
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email sent:', info.response);
                } catch (error) {
                    console.error('Error sending email:', error);
                    throw new Error('Failed to send email');
                }
            };
            const emailContent = `
        <div style="background-color: #e8f5e9; padding: 20px; width: 100%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${user.fullname},</h2>
        <p style="color: #333;">Thank you for your purchase at Dunamismusiccenter.onrender.com. Your order has been successfully placed.</p>
        <p style="color: #333;">To ensure smooth delivery of your items, please note the following:</p>
        <ul style="color: #333; list-style-type: none; padding-left: 20px;">
            <li>Your total payment amount: ₱${totalAmount.toFixed(2)}</li>
            <li>Your order will be delivered within 1 hour.</li>
        </ul>
        <p style="color: #333;">If you have any questions or concerns regarding your order, feel free to contact us at cherry@gmail.com.</p>
        <p style="color: #333;">Thank you for shopping with us!</p>
    </div>
        `;
            sendEmail(
                'Dunamismusiccenter.onrender.com <cherry@gmail.com>',
                user.email,
                'Order Checkout',
                emailContent
            );
            req.flash('message', 'Order Checkout. Please check your email');
            return res.redirect('/carts');
        } else {
            console.log('checkbox123', checkbox);
            req.flash('message', 'Please Select only 1 Method Payment.');
            return res.redirect('/carts')
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Internal Server Error');
    }
};

