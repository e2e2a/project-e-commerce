const SITE_TITLE = 'Dunamis';
const User = require('../../models/user');
const Enrollment = require('../../models/enrollment');


module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'professor') {
            const studentClass = await Enrollment.find({ professorId: userLogin._id, status: 'approved' })
            res.render('professor/schedule', {
                site_title: SITE_TITLE,
                title: 'Schedule',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                currentUrl: req.originalUrl,
                studentClass: studentClass,
            })
        } else {
            return res.status(404).redirect('404');
        }
    } else {
        return res.redirect('/login')
    }
}