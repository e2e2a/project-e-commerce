const SITE_TITLE = 'Dunamis';
const Course = require('../../models/course');
const Enroll = require('../../models/enrollment');
const User = require('../../models/user');
const Cart = require('../../models/cart');
module.exports.index = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    const courses = await Course.find();
    res.render('courses', {
        site_title: SITE_TITLE,
        title: 'Courses',
        courses: courses,
        req: req,
        messages: req.flash(),
        cart:cart,
        userLogin:userLogin,
        currentUrl: req.originalUrl,
    });
}

module.exports.enroll = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
        const course = await Course.findById(req.params.courseId);
        if (req.session.login) {
            res.render('courseEnrollment', {
                req: req,
                course: course,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                cart:cart,
            });
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

module.exports.doEnroll = async (req, res) => {
    const course = await Course.findById(req.body.courseId);
    const existingEnrollment = await Enroll.findOne({
        userId: req.session.login,
        courseId: req.body.courseId
    });
    if (!existingEnrollment || existingEnrollment.status === 'done' || existingEnrollment.status === 'cancelled') {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const userLogin = await User.findById(req.session.login);
        const enroll = new Enroll({
            userId: req.session.login,
            courseId: req.body.courseId,
            courseTitle: course.title,
            name: req.body.name,
            email: userLogin.email,
            address: req.body.address,
            placeDeath: req.body.placeDeath,
            age: req.body.age,
            gender: req.body.gender,
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
