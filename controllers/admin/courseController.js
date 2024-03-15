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
            req: req,
            messages: req.flash(),
        });
    } else {
        res.render('admin/courseView', {
            site_title: SITE_TITLE,
            title: 'Courses',
            courses: courses,
            req: req,
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

module.exports.doCreate = (req, res) => {
    var upload = multer({
        storage: fileUpload.files.storage(),
        allowedFile: fileUpload.files.allowedFile
    }).single('image');
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(err.status || 500)
                .render('500', { err: err });
        } else if (err) {
            return res
                .status(err.status || 500)
                .render('500', { err: err });
        } else {
            const titleExist = await Course.findOne({ title: req.body.title })
            if (titleExist) {
                req.flash('message', 'Course title Exist');
                return res.redirect(`/admin/course/create`);
            }
            const imageUrlExist = await Course.findOne({ imageURL: `/public/uploads/course/${req.file.filename}` });
            if (imageUrlExist) {
                req.flash('message', 'Course image is in used');
                return res.redirect('/admin/course/create')
            }
            const course = new Course({
                title: req.body.title,
                description: req.body.description,
            });
            course.save().then(async () => {
                course.imageURL = `/public/uploads/course/${req.file.filename}`;
                await course.save();
                console.log('success')
                return res.redirect('/admin/course');
            }, (err) => {
                return res
                    .status(err.status || 500)
                    .render('500', { err: err });
            });
        }
    });
}
module.exports.delete = async (req, res) => {
    const courseId = req.body.courseId;
    const courseToDelete = await Course.findByIdAndDelete(courseId);
    if (courseToDelete) {
        console.log('Course Deleted');
        req.flash('message', 'Course Deleted!');
        return res.redirect('/admin/course');
    } else {
        console.log('failed Course Delete');
        req.flash('message', 'Course Delete Failed!');
        return res.redirect('/admin/course');
    }
}
module.exports.edit = async (req, res) => {

}
module.exports.doEdit = async (req, res) => {

}