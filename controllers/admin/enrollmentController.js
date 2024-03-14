const SITE_TITLE = 'Shope';
const User = require('../../models/user');
const Enrollement = require('../../models/enrollment');
const Course = require('../../models/course');
module.exports.index = async (req, res) => {
    const enrollements = await Enrollement.find();
    if (req.session.login) {
        res.render('admin/enrollmentView', {
            site_title: SITE_TITLE,
            title: 'Enrollment',
            enrollements: enrollements,
            messages: req.flash(),
        });
    } else {
        res.render('admin/enrollmentView', {
            site_title: SITE_TITLE,
            title: 'Enrollment',
            enrollements: enrollements,
            messages: req.flash(),
        });
    }
}
module.exports.create = async (req, res) => {
    res.render('admin/enrollmentCreate', {
        req: req,
        messages: req.flash(),
    });
}
module.exports.doCreate = async (req, res) => {
    const course = await Course.findById(req.body.courseId);
    const existingEnrollment = await Enrollement.findOne({
        userId: req.session.login,
        courseId: req.body.courseId
    });
    if (!existingEnrollment || existingEnrollment.status === 'done' || existingEnrollment.status === 'cancelled') {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const enroll = new Enrollement({
            userId: req.session.login,
            courseId: req.body.courseId,
            courseTitle: course.title,
            name: req.body.name,
            address: req.body.address,
            placeDeath: req.body.placeDeath,
            age: req.body.age,
            contact: req.body.contact,
            fatherName: req.body.fatherName,
            motherName: req.body.motherName,
            level: req.body.level,
            schedule: req.body.schedule,
            time: req.body.time,
            dateEnrolling: formattedDate,
            isApproved: 'false',
        });
        await enroll.save();
        console.log('success enrollment');
        req.flash('message', 'Enrollement Successful!');
        return res.redirect('/courses');
    } else {
        console.log('user Already apply this enrollment');
        req.flash('message', 'You are already enrolled in this course.');
        return res.redirect('/courses');
    }
}