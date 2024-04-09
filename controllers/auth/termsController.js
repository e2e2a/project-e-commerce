const SITE_TITLE = 'Dunamis';

module.exports.index = async (req, res) => {
    res.render('termsandcondition', {
        site_title: SITE_TITLE,
        title: 'Terms and Condition',
        req: req,
        messages: req.flash(),
        currentUrl: req.originalUrl,
    });
}