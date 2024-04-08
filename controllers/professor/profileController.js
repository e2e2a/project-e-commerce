const User = require('../../models/user')
const SITE_TITLE = 'Deceased profiling management system with email notification';
const bcrypt = require('bcrypt');

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'professor') {
                res.render('professor/profile', {
                    site_title: SITE_TITLE,
                    title: 'Profile',
                    userLogin: userLogin,
                    messages: req.flash(),
                    currentUrl: req.originalUrl,
                })
            } else {
                return res.status(400).render('404')
            }
        } else {
            return res.redirect('/login')
        }
    } catch (error) {

    }
}
module.exports.doUpdate = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin.email !== req.body.email) {
            const existingEmail = await User.findOne({ email: req.body.email });
            if (existingEmail && existingEmail.isVerified === true) {
                req.flash('message', 'Email is already Exist')
                return res.redirect('/professor/profile');
            }
            const password = req.body.password;
            const confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) {
                req.flash('message', 'password does not match.')
                return res.redirect('/professor/profile');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const data = {
                fullname: req.body.fullname,
                email: req.body.email,
                age: req.body.age,
                address: req.body.address,
                password: hashedPassword,
            }
            const user = await User.findByIdAndUpdate(req.session.login, data, { new: true });
            req.flash('message', 'Profile Updated.');
            return res.redirect('/professor/profile');
        } else {
            const password = req.body.password;
            const confirmPassword = req.body.confirmPassword;
            if (password !== confirmPassword) {
                req.flash('message', 'password does not match.')
                return res.redirect('/professor/profile');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const data = {
                fullname: req.body.fullname,
                email: req.body.email,
                age: req.body.age,
                address: req.body.address,
                password: hashedPassword,
            }
            const user = await User.findByIdAndUpdate(req.session.login, data, { new: true });
            req.flash('message', 'Profile Updated.');
            return res.redirect('/professor/profile');
        }
    } catch (error) {
        console.log('error:', error);
        return res.status(500).render('500');
    }
}