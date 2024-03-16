const User = require('../../models/user');
const SITE_TITLE = 'Dunamis';

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            res.render('admin/index', {
                site_title: SITE_TITLE,
                title: 'Dashboard',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                currentUrl: req.originalUrl,
            })
        } else {
            return res.status(404).render('404',{userLogin:userLogin})
        }
    } else {
        return res.redirect('/login');
    }
}