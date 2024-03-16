const SITE_TITLE = 'Dunamis';
const Course = require('../../models/course');
const Enroll = require('../../models/enrollment');
var bcrypt = require("bcrypt");
const User = require('../../models/user');
const UserEdit = require('../../models/userEdit');
const UserToken = require('../../models/userToken');
const Cart = require('../../models/cart');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

module.exports.index = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        res.render('profile', {
            site_title: SITE_TITLE,
            title: 'Profile',
            req: req,
            messages: req.flash(),
            cart: cart,
            userLogin: userLogin,
            currentUrl: req.originalUrl,
        })
    } else {
        return res.redirect('/login')
    }
}

module.exports.doEdit = async (req, res) => {
    const userId = req.session.login;
    const user = await User.findById(userId);
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (user) {
        if (user.email === req.body.email) {
            console.log(req.body.email)

            if (!password && !confirmPassword) {
                const updateUser = {
                    fullname: req.body.fullname,
                    email: req.body.email,
                    address: req.body.address,
                    age: req.body.age,
                };
                const updatedUser = await User.findByIdAndUpdate(userId, updateUser, {
                    new: true
                });
                if (updatedUser) {
                    console.log('Success');
                    req.flash('message', 'Profile Updated!');
                    return res.redirect('/profile');
                } else {
                    console.log('Update failed');
                    req.flash('message', 'Profile Update Failed!');
                    return res.redirect('/profile');
                }
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/profile');
                }

                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/profile');
                    }

                    const updateUser = {
                        fullname: req.body.fullname,
                        email: req.body.email,
                        address: req.body.address,
                        age: req.body.age,
                        password: hash,
                    };

                    try {
                        const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
                        if (updatedUser) {
                            console.log('Success');
                            req.flash('message', 'Profile Updated!');
                            return res.redirect('/profile');
                        } else {
                            console.log('Update failed');
                            req.flash('message', 'Profile Update Failed!');
                            return res.redirect('/profile');
                        }
                    } catch (error) {
                        console.error("Error updating user:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.status(500).render('500');
                    }
                });
            }
        } else {
            const password = req.body.password;
            const confirmPassword = req.body.confirmPassword;
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                if (existingUser.isVerified === true) {
                    req.flash('message', 'Email Already Used!');
                    return res.redirect('/profile');
                }
            }

            const userEdit = await UserEdit.findOne({ userId: req.session.login })
            if (userEdit) {
                const userId = req.session.login
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/profile');
                }
                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/profile');
                    }
                    const updateUser = {
                        userId: req.session.login,
                        fullname: req.body.fullname,
                        email: req.body.email,
                        address: req.body.address,
                        age: req.body.age,
                        password: hash,
                        isVerified: true,
                    };
                    const updatedUser = await UserEdit.findOneAndUpdate({ userId: req.session.login }, updateUser, { new: true });
                    const registrationToken = jwt.sign({ userId: updatedUser._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                    const verificationCode = sixDigitCode();
                    const userToken = new UserToken({
                        userId: updatedUser._id,
                        token: registrationToken,
                        verificationCode: verificationCode,
                        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 mins expiration
                    });
                    await userToken.save();
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'emonawong22@gmail.com',
                            pass: 'nouv heik zbln qkhf',
                        },
                    });
                    const sendEmail = async (from, to, subject, htmlContent) => {
                    };
                    // link
                    const verificationLink = `http://Dunamismusiccenter.onrender.com/verifyEdit?token=${registrationToken}`;
                    const emailContent = `
                    <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #000;">Hello ${user.fullname},</h2>
                        <p style="color: #000;">Thank you for updating your email address on our website. To ensure the security of your account, please verify your new email address.</p>
                        <div style="background-color: #f2f2f2; padding: 10px; text-align: justify;">
                            <h3 style="color: #000;"><a href="http://Dunamismusiccenter.onrender.com">Dunamismusiccenter.onrender.com</a></h3>
                            <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                            <br/>
                            <p style="color: #000;">Verifying your email address helps us ensure the security of your account and prevents unauthorized access.</p>
                            <br/>
                            <p style="color: #000;">It also ensures that you receive important notifications and updates regarding your account.</p>
                            <br/>
                            <p style="color: #000;">Please click on the link above and enter the verification code to complete the process.</p>
                            <br/>
                            <p style="color: #000;">If you did not request this change, please contact our support team immediately.</p>
                            <br/>
                        </div>
                    </div>
                        `;
                    sendEmail(
                        'Dunamismusiccenter.onrender.com <cherry@gmail.com>',
                        updatedUser.email,
                        'Verify your new email',
                        emailContent
                    );
                    console.log('Verification email sent. Please verify your email to complete registration.');
                    return res.redirect(`/verifyEdit?token=${registrationToken}&sendcode=true`,);
                });
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/profile');
                }
                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/profile');
                    }
                    const updateUser = new UserEdit({
                        userId: req.session.login,
                        fullname: req.body.fullname,
                        email: req.body.email,
                        contact: req.body.contact,
                        address: req.body.address,
                        password: hash,
                        isVerified: true,
                    });
                    const updatedUser = await updateUser.save();
                    const registrationToken = jwt.sign({ userId: updatedUser._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                    const verificationCode = sixDigitCode();
                    const userToken = new UserToken({
                        userId: updatedUser._id,
                        token: registrationToken,
                        verificationCode: verificationCode,
                        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 mins expiration
                    });
                    await userToken.save();
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
                    // link
                    const verificationLink = `http://Dunamismusiccenter.onrender.com/verifyEdit?token=${registrationToken}`;
                    const emailContent = `
                    <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #000;">Hello ${user.fullname},</h2>
                        <p style="color: #000;">Thank you for updating your email address on our website. To ensure the security of your account, please verify your new email address.</p>
                        <div style="background-color: #f2f2f2; padding: 10px; text-align: justify;">
                            <h3 style="color: #000;"><a href="http://Dunamismusiccenter.onrender.com">Dunamismusiccenter.onrender.com</a></h3>
                            <p style="color: #000;">Your verification code is: <strong>${verificationCode}</strong></p>
                            <br/>
                            <p style="color: #000;">Verifying your email address helps us ensure the security of your account and prevents unauthorized access.</p>
                            <br/>
                            <p style="color: #000;">It also ensures that you receive important notifications and updates regarding your account.</p>
                            <br/>
                            <p style="color: #000;">Please click on the link above and enter the verification code to complete the process.</p>
                            <br/>
                            <p style="color: #000;">If you did not request this change, please contact our support team immediately.</p>
                            <br/>
                        </div>
                    </div>
                        `;
                    sendEmail(
                        'Dunamismusiccenter.onrender.com <cherry@gmail.com>',
                        updatedUser.email,
                        'Verify your new email',
                        emailContent
                    );
                    console.log('Verification email sent. Please verify your email to complete registration.');
                    return res.redirect(`/verifyEdit?token=${registrationToken}&sendcode=true`,);
                });
            }
        }
    }
}