const SITE_TITLE = 'Dunamis';
const User = require('../../models/user');
const Enrollment = require('../../models/enrollment');

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const users = await User.find({ role: 'professor' });
            res.render('admin/professorView', {
                site_title: SITE_TITLE,
                title: 'Professor',
                users: users,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin });
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.schedule = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const professorId = req.params.id;
            const professor = await User.findById(professorId);
            const studentClass = await Enrollment.find({ professorId: professor._id }).populate('professorId');
            res.render('admin/professorScheduleView', {
                site_title: SITE_TITLE,
                title: 'Schedule',
                req: req,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                studentClass: studentClass,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin });
        }
    } else {
        return res.redirect('/login');
    }
}
