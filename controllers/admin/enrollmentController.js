const SITE_TITLE = 'Shope';
const User = require('../../models/user');
const Enrollement = require('../../models/enrollment');

module.exports.index = async (req, res) => {
    const enrollements = await Enrollement.find();
    if (req.session.login) {
        res.render('admin/enrollmentView', {
            site_title: SITE_TITLE,
            title: 'Enrollment',
            enrollements: enrollements
        });
    } else {
        res.render('admin/enrollmentView', {
            site_title: SITE_TITLE,
            title: 'Enrollment',
            enrollements: enrollements
        });
    }
}
module.exports.create = async (req, res) => {
    res.render('admin/userCreate', {
        req: req,
    });
}
module.exports.doCreate = async (req, res) => {
    const email = req.body.email;
    const existingUser = await User.findOne({ email: email });
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (existingUser) {
        if (existingUser.isVerified === 'true') {
            req.flash('message', 'Email Already Used!');
            return res.redirect('/admin/user');
        } else {
            if (password !== confirmPassword) {
                req.flash('message', 'Password does not match.');
                return res.redirect(`/dashboard/user/create`);
            }
            const user = {
                fullname: req.body.fullname,
                email: req.body.email,
                address: req.body.address,
                age: req.body.age,
                role: req.body.role,
                password: req.body.password,
                isVerified: 'true'
            };
            const updatedUser = await User.findByIdAndUpdate(existingUser._id, user, {
                new: true
            });
            if (updatedUser) {
                console.log('success creating user')
                return res.redirect('/admin/user');
            } else {
                console.log('creating user failed');
                req.flash('message', 'Profile Update Failed!');
                return res.redirect('/edit');
            }
        }
    }else{
        if (password !== confirmPassword) {
            req.flash('message', 'Password does not match.');
            return res.redirect(`/dashboard/user/create`);
        }
        const user = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            address: req.body.address,
            age: req.body.age,
            role: req.body.role,
            password: req.body.password,
            isVerified: 'true'
        });
        user.save().then(async () => {
            console.log('success creating user')
            return res.redirect('/admin/user');
        }, (err) => {
            return res
                .status(err.status || 500)
                .render('500', { err: err });
        });
    }
}