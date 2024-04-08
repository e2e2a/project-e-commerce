const SITE_TITLE = 'Dunamis';
const User = require('../../models/user');


module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if(userLogin){
        res.render('professor/index', {
            site_title: SITE_TITLE,
            title: 'Home',
            req: req,
            messages: req.flash(),
            userLogin: userLogin,
            currentUrl: req.originalUrl,
        })
    }else{
        return res.redirect('/login')
    }
}