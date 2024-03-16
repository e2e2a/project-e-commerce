const SITE_TITLE = 'Dunamis';
const multer = require('multer');
const Course = require('../../models/course');
const User = require('../../models/user');
var fileUpload = require('../../middlewares/course-upload-middleware');
module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const courses = await Course.find();
            res.render('admin/courseView', {
                site_title: SITE_TITLE,
                title: 'Courses',
                courses: courses,
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

module.exports.create = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            res.render('admin/courseCreate', {
                req: req,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
            })
        } else {
            return res.status(404).render('404');
        }
    } else {
        return res.redirect('/login');
    }

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
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            try {
                const courseId = req.params.courseId
                const course = await Course.findById(courseId)
                res.render('admin/courseEdit', {
                    site_title: SITE_TITLE,
                    title: 'Course Update',
                    course: course,
                    messages: req.flash(),
                    currentUrl: req.originalUrl,
                    userLogin: userLogin,
                });
            } catch (err) {
                return res
                    .status(err.status || 500)
                    .render('500', { err: err });
            }
        } else {
            return res.status(404).render('404');
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.doEdit = async (req, res) => {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
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
            const titleChange = req.body.title;
            if (course.title !== titleChange) {
                const titleExist = await Course.findOne({ title: req.body.title })
                if (titleExist) {
                    req.flash('message', 'Course title Exist');
                    return res.redirect(`/admin/course/edit/${course._id}`);
                }
            }
            let imageUrl = '';
            if (course.imageURL) {
                imageUrl = course.imageURL;
            }
            if (req.file) {
                imageUrl = `/public/uploads/course/${req.file.filename}`;
                const imageUrlExist = await Course.findOne({ imageURL: `/public/uploads/course/${req.file.filename}` });
                if (imageUrlExist) {
                    req.flash('message', 'Course image is in used');
                    return res.redirect(`/admin/course/edit/${course._id}`)
                }
            }
            const courseData = {
                title: req.body.title,
                imageURL: imageUrl,
                description: req.body.description,
            };
            const updatedCourse = await Course.findByIdAndUpdate(courseId, courseData, {
                new: true
            })
            if (updatedCourse) {
                console.log('success update');
                req.flash('message', 'Course Updated');
                return res.redirect('/admin/course');
            } else {
                return res
                    .status(404)
                    .render('404', { err: err });
            }
        }
    });
}