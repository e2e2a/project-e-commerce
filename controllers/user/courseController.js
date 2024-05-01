const SITE_TITLE = 'Dunamis';
const Course = require('../../models/course');
const Enroll = require('../../models/enrollment');
const User = require('../../models/user');
const Cart = require('../../models/cart');
const qr = require('qrcode');
const mongoose = require('mongoose');

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
        cart: cart,
        userLogin: userLogin,
        currentUrl: req.originalUrl,
    });
}

module.exports.enroll = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
        if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
            console.log('Invalid req.params.courseId:', req.params.courseId);
            return res.status(404).render('404', { userLogin: {
                role:'user',
            } });
        }
        const course = await Course.findById(req.params.courseId);
        if (req.session.login) {
            res.render('courseEnrollment', {
                site_title: SITE_TITLE,
                req: req,
                course: course,
                title: 'Enroll',
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                cart: cart,
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
            age: req.body.age,
            gender: req.body.gender,
            contact: req.body.contact,
            fatherName: req.body.fatherName,
            motherName: req.body.motherName,
            level: req.body.level,
            schedule: req.body.schedule,
            time: req.body.time,
            dateEnrolling: formattedDate,
            isApproved: false,
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

module.exports.enrollQrcode = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
        return res.redirect('/login')
    }
    const courses = await Course.find();
    const userEnrollment = await Enroll.findOne({ userId: userLogin._id })
        .sort({ createdAt: -1 }) // Assuming createdAt is the timestamp field
        .populate('userId')
        .populate('professorId');
    const url = `https://dunamismusiccenter.onrender.com/enrollqrcode/${userEnrollment._id}`;
    qr.toDataURL(url, (err, qrDataURL) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error generating QR code');
        }
        res.render('enrollQrcode', {
            site_title: SITE_TITLE,
            title: 'Qr Code',
            courses: courses,
            req: req,
            messages: req.flash(),
            cart: cart,
            userLogin: userLogin,
            currentUrl: req.originalUrl,
            userEnrollment: userEnrollment
        });
    });
}

module.exports.enrollWithQrcode = async (req, res) => {
    const enrollmentId = req.params.enrollmentId;
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
        console.log('Invalid enrollmentId:', enrollmentId);
        return res.status(404).render('404', { userLogin: {
            role:'user',
        } });
    }
    const cart = await Cart.findOne({ userId: req.session.login }).populate('items.productId');
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
        return res.redirect('/login')
    }
    const courses = await Course.find();
    const userEnrollment = await Enroll.findById(enrollmentId).populate('userId');
    res.render('enrollQrcodeSubmit', {
        site_title: SITE_TITLE,
        title: 'Qr Code',
        courses: courses,
        req: req,
        messages: req.flash(),
        cart: cart,
        userLogin: userLogin,
        currentUrl: req.originalUrl,
        userEnrollment: userEnrollment
    });
}

module.exports.doEnrollWithQrcode = async (req, res) => {
    const enrollmentId = req.params.enrollmentId;
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
        console.log('Invalid enrollmentId:', enrollmentId);
        return res.status(404).render('404', { userLogin: {
            role:'user',
        } });
    }
    const course = await Course.findById(req.body.courseId);
    if(!course){
        req.flash('message', 'Enrollement Successful!');
        return res.redirect(`/enrolling/${enrollmentId}`);
    }
    const { name, address, age, gender, contact, fatherName, motherName, level, schedule, time } = req.body;
    if (!name || !address || !age || !gender || !contact || !fatherName || !motherName || !level || !schedule || !time) {
        console.log('Required fields are missing in the request body');
        req.flash('message', 'Please fill up the required fields.')
        return res.redirect(`/enrolling/${enrollmentId}`);
    }
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
            age: req.body.age,
            gender: req.body.gender,
            contact: req.body.contact,
            fatherName: req.body.fatherName,
            motherName: req.body.motherName,
            level: req.body.level,
            schedule: req.body.schedule,
            time: req.body.time,
            dateEnrolling: formattedDate,
            isApproved: false,
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

module.exports.enrollQrcodeScan = async (req, res) => {
    const enrollmentId = req.params.enrollmentId;
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
        console.log('Invalid enrollmentId:', enrollmentId);
        return res.status(404).render('404', { userLogin: {
            role:'user',
        } });
    }
    const enrollment = await Enroll.findById(enrollmentId);
    req.session.login = enrollment.userId;
    res.render('loadingState', {
        enrollment: enrollment
    });
}