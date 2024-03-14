const SITE_TITLE = 'Shope';
const Course = require('../../models/course');
const Enroll = require('../../models/enrollment');
module.exports.index = async (req, res) => {
    const courses = await Course.find();
    res.render('courses', {
        site_title: SITE_TITLE,
        title: 'Courses',
        courses: courses,
        req: req,
    });
}

module.exports.enroll = async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    res.render('courseEnrollment', {
        req: req,
        course: course,
    });
}

module.exports.doEnroll = async (req, res) => {
    const course = await Course.findById(req.body.courseId);
    const existingEnrollment = await Enroll.findOne({
        userId: req.session.login,
        courseId: req.body.courseId
    });
    if (!existingEnrollment || existingEnrollment.contract === 'done' || existingEnrollment.contract === 'cancelled') {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const enroll = new Enroll({
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
        // User is already enrolled in the course
        req.flash('error', 'You are already enrolled in this course.');
        return res.redirect('/courses');
    }
}
