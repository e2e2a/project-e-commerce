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
    const userLogin = await User.findById(req.session.login);
    res.render('admin/enrollmentCreate', {
        req: req,
        messages: req.flash(),
        userLogin: userLogin,
    });
}

module.exports.doCreate = async (req, res) => {
    const titleChecking = await Course.find({ title: req.body.courseTitle })
    console.log(req.body.courseTitle)
    console.log(titleChecking)
    if (titleChecking && titleChecking.length > 0) {
        const existingEnrollment = await Enrollement.findOne({
            name: req.body.name,
            courseTitle: req.body.courseTitle
        });
        if (!existingEnrollment || existingEnrollment.status === 'done' || existingEnrollment.status === 'cancelled') {
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];
            const enroll = new Enrollement({
                userId: req.session.login,
                courseTitle: req.body.courseTitle,
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
            return res.redirect('/admin/enrollment');
        } else {
            console.log('user Already apply this enrollment');
            req.flash('message', 'You are already enrolled in this course.');
            return res.redirect('/admin/enrollment/create');
        }
    } else {
        console.log('failed no title exist in course');
        req.flash('message', 'Title does not Exist!');
        return res.redirect('/admin/enrollment/create');
    }
}