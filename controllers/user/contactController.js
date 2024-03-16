const Cart = require('../../models/cart');
const User = require('../../models/user');
const Product = require('../../models/product');
const Order = require('../../models/order');
const nodemailer = require('nodemailer');
const SITE_TITLE = 'Dunamis';

module.exports.index = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    res.render('contact', {
        site_title: SITE_TITLE,
        title: 'Contact',
        req: req,
        messages: req.flash(),
        cart:cart,
        userLogin:userLogin,
        currentUrl: req.originalUrl,
    });
}

module.exports.doContact = async (req,res) => {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
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
            return res.status(500).render('500');
        }
    };
    const emailContent = `
    <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #007bff; margin-bottom: 20px;">Hello Dunamismusiccenter Team,</h2>
        <p style="color: #333;">You have received a new contact message:</p>
        <p style="color: #333;"><strong>Name:</strong> ${name}</p>
        <p style="color: #333;"><strong>Email:</strong> ${email}</p>
        <p style="color: #333;"><strong>Subject:</strong> ${subject}</p>
        <p style="color: #333;"><strong>Message:</strong> ${message}</p>
    </div>
            `;
    sendEmail(
        'dunamismusiccenter.onrender.com <cherry@gmail.com>',
        'dunamismusiccenter.onrender.com <cherry@gmail.com>',
        // user.email,
        'Contact Message',
        emailContent
    );
    req.flash('message', 'Message has been send.');
    return res.redirect('/contact')
}