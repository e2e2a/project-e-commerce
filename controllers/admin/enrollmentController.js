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
    if (titleChecking && titleChecking.length > 0) {
        const existingEnrollment = await Enrollement.findOne({
            name: req.body.name,
            courseTitle: req.body.courseTitle
        });
        if (!existingEnrollment || existingEnrollment.status === 'done' || existingEnrollment.status === 'disaproved') {
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

module.exports.actions = async (req, res) => {
    const actions = req.body.actions;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const enrollementId = req.body.enrollementId;
    if (actions === 'approved') {
        const userEnrollment = await Enrollement.findByIdAndUpdate(enrollementId, { isApproved: true, dateApproved: formattedDate, status: 'approved' }, { new: true });
        if (userEnrollment) {
            console.log('Success enrollment approved');
            req.flash('message', 'Enrollment approved successfully!');
            return res.redirect('/admin/enrollment');
        } else {
            console.log('Failed enrollment approved');
            req.flash('message', 'Enrollment approved Failed!');
            return res.redirect('/admin/enrollment');
        }
    } else if (actions === 'disapproved') {
        const userEnrollment = await Enrollement.findByIdAndUpdate(enrollementId, { isApproved: true, dateDisapproved: formattedDate, status: 'disapproved' }, { new: true });
        if (userEnrollment) {
            console.log('Enrollment Disapproved');
            req.flash('message', 'Enrollment Disapproved successfully!');
            return res.redirect('/admin/enrollment');
        } else {
            console.log('Failed enrollment Disapproved');
            req.flash('message', 'Enrollment Disapproved Failed!');
            return res.redirect('/admin/enrollment');
        }
    }
}

module.exports.statusApproved = async (req, res) => {
    const enrollements = await Enrollement.find();
    const userLogin = await User.findById(req.session.login);
    res.render('admin/enrollmentApproved', {
        site_title: SITE_TITLE,
        title: 'Enrollment',
        req: req,
        messages: req.flash(),
        userLogin: userLogin,
        enrollements: enrollements
    });
}
module.exports.deleteApproved = async (req, res) => {
    const enrollementId = req.body.enrollementId;
    const enrollementToDelete = await Enrollement.findByIdAndDelete(enrollementId);
    if (enrollementToDelete) {
        console.log('enrollment Deleted');
        req.flash('message', 'Enrollment Deleted!');
        return res.redirect('/admin/enrollment/approved');
    } else{
        console.log('failed enrollment Deleted');
        req.flash('message', 'Enrollment Deleted Failed!');
        return res.redirect('/admin/enrollment/approved');
    }
}

module.exports.statusDisapproved = async (req, res) => {
    const enrollements = await Enrollement.find();
    const userLogin = await User.findById(req.session.login);
    res.render('admin/enrollmentDisapproved', {
        site_title: SITE_TITLE,
        title: 'Enrollment',
        req: req,
        messages: req.flash(),
        userLogin: userLogin,
        enrollements: enrollements
    });
}
module.exports.deleteDisapproved = async (req, res) => {
    const enrollementId = req.body.enrollementId;
    const enrollementToDelete = await Enrollement.findByIdAndDelete(enrollementId);
    if (enrollementToDelete) {
        console.log('enrollment Deleted');
        req.flash('message', 'Enrollment Deleted!');
        return res.redirect('/admin/enrollment/disapproved');
    } else{
        console.log('failed enrollment Deleted');
        req.flash('message', 'Enrollment Deleted Failed!');
        return res.redirect('/admin/enrollment/disapproved');
    }
}

module.exports.statusDone = async (req, res) => {
    const enrollements = await Enrollement.find();
    const userLogin = await User.findById(req.session.login);
    res.render('admin/enrollmentDone', {
        site_title: SITE_TITLE,
        title: 'Enrollment',
        req: req,
        messages: req.flash(),
        userLogin: userLogin,
        enrollements: enrollements
    });
}

module.exports.deleteDone = async (req, res) => {
    const enrollementId = req.body.enrollementId;
    const enrollementToDelete = await Enrollement.findByIdAndDelete(enrollementId);
    if (enrollementToDelete) {
        console.log('enrollment Deleted');
        req.flash('message', 'Enrollment Deleted!');
        return res.redirect('/admin/enrollment/done');
    } else{
        console.log('failed enrollment Deleted');
        req.flash('message', 'Enrollment Deleted Failed!');
        return res.redirect('/admin/enrollment/done');
    }
}

