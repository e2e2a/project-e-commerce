const User = require('../../models/user')
const SITE_TITLE = 'shope';
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
module.exports.register = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (req.session.login) {
            return res.redirect('/index');
        } else {
            res.render('register', {
                site_title: SITE_TITLE,
                title: 'Register',
                session: req.session,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                req: req,
            });
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

module.exports.doRegister = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            if (existingUser.isVerified) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/register');
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/register');
                }
                const user = new User({
                    fullname: req.body.fullname,
                    email: req.body.email,
                    address: req.body.address,
                    age: req.body.age,
                    role: 'user',
                    password: req.body.password,
                    isVerified: false,
                });
                await user.save();
                const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                const verificationCode = sixDigitCode();
                const userToken = new UserToken({
                    userId: user._id,
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
                        return res.status(500).render('500');
                    }
                };
                const verificationLink = `http://dunamismusiccenter.onrender.com/verify?token=${registrationToken}`;
                const emailContent = `
                <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${user.fullname},</h2>
                    <p style="color: #333;">Welcome aboard! We're delighted to have you as part of our community. To unlock all the features our platform offers, we kindly request you to verify your email address.</p>
                    <h3 style="color: #007bff; margin-top: 20px; margin-bottom: 10px;"><a href="http://dunamismusiccenter.onrender.com" style="text-decoration: none; color: #007bff;">Dunamismusiccenter.onrender.com</a></h3>
                    <p style="color: #333;">Your unique verification code is: <strong style="color: #007bff;">${verificationCode}</strong></p>
                    <br>
                    <p style="color: #333;">By verifying your email, you're assisting us in maintaining a secure environment for all our users. It's a crucial step in our dedication to ensuring a seamless experience for you.</p>
                    <br>
                    <p style="color: #333;">This verification process guarantees that your account remains accessible only to you, safeguarding your data and enhancing your privacy.</p>
                    <br>
                    <p style="color: #333;">Should you encounter any challenges or have questions, our support team is here to guide you every step of the way.</p>
                    <br>
                </div>
                        `;
                sendEmail(
                    'dunamismusiccenter.onrender.com <cherry@gmail.com>',
                    user.email,
                    'Verify your email',
                    emailContent
                );
                console.log('Verification email sent. Please verify your email to complete registration.');
                return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);
            }
        } else {
            if (password !== confirmPassword) {
                req.flash('message', 'Password does not match.');
                return res.redirect('/register');
            }
            const user = new User({
                fullname: req.body.fullname,
                email: req.body.email,
                address: req.body.address,
                age: req.body.age,
                role: 'user',
                password: req.body.password,
                isVerified: false,
            });
            await user.save();
            const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
            const verificationCode = sixDigitCode();
            const userToken = new UserToken({
                userId: user._id,
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
                    return res.status(500).render('500');
                }
            };
            // link
            const verificationLink = `http://dunamismusiccenter.onrender.com/verify?token=${registrationToken}`;
            const emailContent = `
            <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${user.fullname},</h2>
                <p style="color: #333;">Welcome aboard! We're delighted to have you as part of our community. To unlock all the features our platform offers, we kindly request you to verify your email address.</p>
                <h3 style="color: #007bff; margin-top: 20px; margin-bottom: 10px;"><a href="http://dunamismusiccenter.onrender.com" style="text-decoration: none; color: #007bff;">dunamismusiccenter.onrender.com</a></h3>
                <p style="color: #333;">Your unique verification code is: <strong style="color: #007bff;">${verificationCode}</strong></p>
                <br>
                <p style="color: #333;">By verifying your email, you're assisting us in maintaining a secure environment for all our users. It's a crucial step in our dedication to ensuring a seamless experience for you.</p>
                <br>
                <p style="color: #333;">This verification process guarantees that your account remains accessible only to you, safeguarding your data and enhancing your privacy.</p>
                <br>
                <p style="color: #333;">Should you encounter any challenges or have questions, our support team is here to guide you every step of the way.</p>
                <br>
            </div>
                `;
            sendEmail(
                'dunamismusiccenter.onrender.com <cherry@gmail.com>',
                user.email,
                'Verify your email',
                emailContent
            );
            console.log('Verification email sent. Please verify your email to complete registration.');
            return res.redirect(`/verify?token=${registrationToken}&sendcode=true`,);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).render('500');
    }
}