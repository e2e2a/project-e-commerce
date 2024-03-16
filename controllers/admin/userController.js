const SITE_TITLE = 'Dunamis';
const User = require('../../models/user');
var bcrypt = require("bcrypt");

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (condition) {
        if (condition) {
            const users = await User.find();
            res.render('admin/userView', {
                site_title: SITE_TITLE,
                title: 'User',
                users: users,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            });
        } else {
            return res.status(404).render('404');
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.create = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            res.render('admin/userCreate', {
                site_title: SITE_TITLE,
                title: 'User',
                req: req,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            });
        } else {
            return res.status(404).render('404');
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.doCreate = async (req, res) => {
    const email = req.body.email;
    const existingUser = await User.findOne({ email: email });
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (existingUser) {
        if (existingUser.isVerified) {
            req.flash('message', 'Email Already Used!');
            return res.redirect('/admin/user');
        } else {
            if (password !== confirmPassword) {
                req.flash('message', 'Password does not match.');
                return res.redirect(`/admin/user/create`);
            }
            const user = {
                fullname: req.body.fullname,
                email: req.body.email,
                address: req.body.address,
                age: req.body.age,
                role: req.body.role,
                password: req.body.password,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(existingUser._id, user, {
                new: true
            });
            if (updatedUser) {
                console.log('success creating user')
                req.flash('message', 'User Created!');
                return res.redirect('/admin/user');
            } else {
                console.log('creating user failed');
                req.flash('message', 'Creating user Failed!');
                return res.redirect('/edit');
            }
        }
    } else {
        if (password !== confirmPassword) {
            req.flash('message', 'Password does not match.');
            return res.redirect(`/admin/user/create`);
        }
        const user = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            address: req.body.address,
            age: req.body.age,
            role: req.body.role,
            password: req.body.password,
            isVerified: true
        });
        user.save().then(async () => {
            console.log('success creating user');
            req.flash('message', 'User Created!');
            return res.redirect('/admin/user');
        }, (err) => {
            return res
                .status(err.status || 500)
                .render('500', { err: err });
        });
    }
}

module.exports.edit = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const userId = req.params.id;
            const user = await User.findById(userId)
            res.render('admin/userEdit', {
                site_title: SITE_TITLE,
                title: 'User',
                req: req,
                messages: req.flash(),
                user: user,
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            });
        } else {
            return res.status(404).render('404');
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.doEdit = async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId)
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const email = req.body.email;
    if (user.email === email) {
        if (!password) {
            const user = {
                fullname: req.body.fullname,
                email: req.body.email,
                address: req.body.address,
                age: req.body.age,
                role: req.body.role,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(userId, user, {
                new: true
            });
            if (updatedUser) {
                console.log('success creating user')
                req.flash('message', 'User Updated!');
                return res.redirect('/admin/user');
            } else {
                console.log('creating user failed');
                req.flash('message', 'User Update Failed!');
                return res.redirect('/edit');
            }
        } else {
            if (password !== confirmPassword) {
                req.flash('message', 'Password does not match.');
                return res.redirect(`/admin/user/edit/${user._id}`);
            }
            bcrypt.hash(password, 10, async (error, hash) => {
                if (error) {
                    console.error("Error hashing password:", error);
                    req.flash('message', 'An error occurred. Please try again.');
                    return res.redirect('/edit');
                }
                const user = {
                    fullname: req.body.fullname,
                    email: req.body.email,
                    address: req.body.address,
                    age: req.body.age,
                    role: req.body.role,
                    password: hash,
                    isVerified: true
                };
                const updatedUser = await User.findByIdAndUpdate(userId, user, {
                    new: true
                });
                if (updatedUser) {
                    console.log('User updated!')
                    req.flash('message', 'User Updated!');
                    return res.redirect('/admin/user');
                } else {
                    console.log('update user failed');
                    req.flash('message', 'User Update Failed!');
                    return res.redirect('/edit');
                }
            });
        }
    } else {
        const existingUser = await User.findOne({ email: email });
        if (!password) {
            if (existingUser) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/admin/user');
            } else {
                const user = {
                    fullname: req.body.fullname,
                    email: req.body.email,
                    address: req.body.address,
                    age: req.body.age,
                    role: req.body.role,
                    isVerified: true
                };
                const updatedUser = await User.findByIdAndUpdate(userId, user, {
                    new: true
                });
                if (updatedUser) {
                    console.log('success Updated user')
                    req.flash('message', 'User Updated!');
                    return res.redirect('/admin/user');
                } else {
                    console.log('Update user failed');
                    req.flash('message', 'User Update Failed!');
                    return res.redirect('/edit');
                }
            }
        } else {
            if (existingUser) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/admin/user');
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect(`/admin/user/edit/${user._id}`);
                }
                bcrypt.hash(password, 10, async (error, hash) => {
                    if (error) {
                        console.error("Error hashing password:", error);
                        req.flash('message', 'An error occurred. Please try again.');
                        return res.redirect('/edit');
                    }
                    const user = {
                        fullname: req.body.fullname,
                        email: req.body.email,
                        address: req.body.address,
                        age: req.body.age,
                        role: req.body.role,
                        password: hash,
                        isVerified: true
                    };
                    const updatedUser = await User.findByIdAndUpdate(userId, user, {
                        new: true
                    });
                    if (updatedUser) {
                        console.log('User updated!')
                        req.flash('message', 'User Updated!');
                        return res.redirect('/admin/user');
                    } else {
                        console.log('update user failed');
                        req.flash('message', 'User Update Failed!');
                        return res.redirect('/edit');
                    }
                });
            }
        }
    }
}

module.exports.delete = async (req, res) => {
    const userId = req.body.userId;
    const userToDelete = await User.findByIdAndDelete(userId);
    if (userToDelete) {
        console.log('user Deleted');
        req.flash('message', 'User Deleted!');
        return res.redirect('/admin/user');
    } else {
        console.log('failed user Deleted');
        req.flash('message', 'User Deleted Failed!');
        return res.redirect('/admin/user');
    }
}