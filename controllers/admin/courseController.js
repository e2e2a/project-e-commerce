const SITE_TITLE = 'Shope';
const multer = require('multer');
const Course = require('../../models/course');
var fileUpload = require('../../middlewares/course-upload-middleware');
module.exports.index = async (req, res) => {
    const courses = await Course.find();
    if (req.session.login) {
        res.render('admin/courseView', {
            site_title: SITE_TITLE,
            title: 'Courses',
            courses: courses,
            req:req,
            messages: req.flash(),
        });
    } else {
        res.render('admin/courseView', {
            site_title: SITE_TITLE,
            title: 'Courses',
            courses: courses,
            req:req,
            messages: req.flash(),
        });
    }
}

module.exports.create = (req, res) => {
    res.render('admin/courseCreate', {
        req: req,
        messages: req.flash(),
    })
};

module.exports.doCreate = (request, response) => {
    var upload = multer({
        storage: fileUpload.files.storage(),
        allowedFile: fileUpload.files.allowedFile
    }).single('image');
    upload(request, response, function (err) {
        if (err instanceof multer.MulterError) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else if (err) {
            return response
                .status(err.status || 500)
                .render('500', { err: err });
        } else {
            const course = new Course({
                title: request.body.title,
                description: request.body.description,
            });
            course.save().then(async () => {
                course.imageURL = `/public/uploads/course/${request.file.filename}`;
                await course.save();
                console.log('success')
                return response.redirect('/admin/course');
            }, (err) => {
                return response
                    .status(err.status || 500)
                    .render('500', { err: err });
            });
        }
    });
}