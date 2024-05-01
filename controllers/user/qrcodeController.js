const Cart = require('../../models/cart');
const User = require('../../models/user');
const SITE_TITLE = 'Dunamis';
const Product = require('../../models/product');
const qr = require('qrcode'); 
const Order = require('../../models/order');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// module.exports.index = async (req, res) => {
//     const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
//     const userLogin = await User.findById(req.session.login);
//     if (!userLogin) {
//         return res.redirect('/login')
//     }
//     const url = `https://dunamismusiccenter.onrender.com/qrcode/checkout?id=${userLogin._id}`;
//     qr.toDataURL(url, (err, qrDataURL) => {
//         if (err) {
//             console.error(err);
//             // Handle error appropriately
//             return res.status(500).send('Error generating QR code');
//         }
//         res.render('qrcode', {
//             site_title: SITE_TITLE,
//             title: 'Qr Code',
//             req: req,
//             messages: req.flash(),
//             cart: cart,
//             userLogin: userLogin,
//             currentUrl: req.originalUrl,
//             qrCodeDataURL: qrDataURL // Pass the QR code data URL to the template
//         });
//     });
// }

module.exports.checkout = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(404).send('Cart not found');
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid subjectId:', id);
            return res.status(404).render('404', { userLogin: { role: 'user' } });
        }
        const cart = await Cart.findOne({ userId: id }).populate('items.productId');
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        let totalAmount = 0;
        for (const item of cart.items) {
            if (item.productId && item.productId.price) {
                totalAmount += item.productId.price * item.quantity;
            }
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { quantity: -item.quantity }
            });
        }

        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
        }));

        const order = new Order({
            userId: id,
            items: orderItems,
            totalAmount: totalAmount,
        });

        await order.save();
        req.session.total = totalAmount;
        await Cart.deleteOne({ _id: cart._id });
        const user = await User.findById(id)
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
        /**
         * @todo email content for sucess payment for gcash
         */
        const emailContent = `
        <div style="background-color: #e8f5e9; padding: 20px; width: 100%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${user.fullname},</h2>
        <p style="color: #333;">Thank you for your purchase at Dunamismusiccenter.onrender.com. Your order has been successfully placed.</p>
        <p style="color: #333;">We have received the payment for your order. To ensure smooth delivery of your items, please note the following:</p>
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
        req.session.login = user._id;

        const userLogin = await User.findById(user._id);
        const total = req.session.total;
        return res.render('gcashPaymentSuccess', {
            site_title: SITE_TITLE,
            title: 'Qr Code',
            req: req,
            messages: req.flash(),
            cart: cart,
            userLogin: userLogin,
            currentUrl: req.originalUrl,
            total: total
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Internal Server Error');
    }
};

// module.exports.success = async (req, res) => {
//     const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
//     const userLogin = await User.findById(req.session.login);
//     if (!userLogin) {
//         return res.redirect('/login')
//     }
//     res.render('gcashPaymentSuccess', {
//         site_title: SITE_TITLE,
//         title: 'Qr Code',
//         req: req,
//         messages: req.flash(),
//         cart: cart,
//         userLogin: userLogin,
//         currentUrl: req.originalUrl,
//     });
// }