const SITE_TITLE = 'Dunamis';
const User = require('../../models/user');
const Enrollement = require('../../models/enrollment');
const Course = require('../../models/course');
const nodemailer = require('nodemailer');
const fs = require('fs');
const qr = require('qr-image');
const path = require('path');
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const enrollements = await Enrollement.find().populate('professorId');
            const professors = await User.find({ role: 'professor' })
            res.render('admin/enrollmentView', {
                site_title: SITE_TITLE,
                title: 'Enrollment',
                enrollements: enrollements,
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                professors: professors,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin });
        }
    } else {
        return res.redirect('/login');
    }
}

module.exports.create = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            res.render('admin/enrollmentCreate', {
                req: req,
                site_title: SITE_TITLE,
                title: 'Enrollment',
                messages: req.flash(),
                userLogin: userLogin,
                currentUrl: req.originalUrl,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin });
        }
    } else {
        return res.redirect('/login')
    }

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
                email: req.body.email,
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
                isApproved: false,
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
        const professorId = req.body.professorId;
        if (!professorId) {
            req.flash('message', 'Please provide a professor!');
            return res.redirect('/admin/enrollment');
        }
        const professor = await User.findOne({ _id: professorId, role: 'professor' })
        if (!professor) {
            req.flash('message', 'Please provide a professor!');
            return res.redirect('/admin/enrollment');
        }

        const userEnrollment = await Enrollement.findByIdAndUpdate(enrollementId, { professorId: professor._id, isApproved: true, dateApproved: formattedDate, status: 'approved' }, { new: true }).populate('userId');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emonawong22@gmail.com',
                pass: 'nouv heik zbln qkhf',
            },
        });

        const sendEmail = async (from, to, subject, htmlContent) => {
            try {
                const mailOptions = {
                    from,
                    to,
                    subject,
                    html: htmlContent,
                };
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).render('500');
            }
        };
        const emailContent = `
        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${userEnrollment.name},</h2>
            <p style="color: #333;">Your enrollment has been approved!</p>
            <p style="color: #333;">Please proceed with the next steps as per the instructions provided.</p>
        </div>
        `;
        sendEmail(
            'dunamismusiccenter.onrender.com <cherry@gmail.com>',
            `${userEnrollment.email}`,
            'Enrollment Approved',
            emailContent
        );
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
        const userEnrollment = await Enrollement.findByIdAndUpdate(enrollementId, { isApproved: true, dateDisapproved: formattedDate, status: 'disapproved' }, { new: true }).populate('userId');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emonawong22@gmail.com',
                pass: 'nouv heik zbln qkhf',
            },
        });

        const sendEmail = async (from, to, subject, htmlContent) => {
            try {
                const mailOptions = {
                    from,
                    to,
                    subject,
                    html: htmlContent,
                };
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).render('500');
            }
        };
        const emailContent = `
        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${userEnrollment.name},</h2>
            <p style="color: #333;">We are very sorry to inform you that your enrollment has been disapproved.</p>
            <p style="color: #333;">Please feel free to contact us if you have any questions or concerns.</p>
        </div>
        `;
        sendEmail(
            'dunamismusiccenter.onrender.com <cherry@gmail.com>',
            `${userEnrollment.email}`,
            'Enrollment Approved',
            emailContent
        );
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
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const enrollements = await Enrollement.find().populate('professorId');
            res.render('admin/enrollmentApproved', {
                site_title: SITE_TITLE,
                title: 'Enrollment',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                enrollements: enrollements,
                currentUrl: req.originalUrl,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin });
        }
    } else {
        return res.redirect('/login')
    }
}
module.exports.statusApprovedActions = async (req, res) => {
    const actions = req.body.actions;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const enrollementId = req.body.enrollementId;
    if (actions === 'done') {
        const userEnrollment = await Enrollement.findByIdAndUpdate(enrollementId, { dateEnd: formattedDate, status: 'done' }, { new: true }).populate('userId').populate('professorId');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emonawong22@gmail.com',
                pass: 'nouv heik zbln qkhf',
            },
        });

        const sendEmail = async (from, to, subject, htmlContent) => {
            try {
                const mailOptions = {
                    from,
                    to,
                    subject,
                    html: htmlContent,
                };
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).render('500');
            }
        };
        const emailContent = `
        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${userEnrollment.name},</h2>
            <p style="color: #333;">We are pleased to inform you that your contract has been successfully completed!</p>
            <p style="color: #333;">All terms and conditions have been fulfilled, and the contract is now marked as done.</p>
            <p style="color: #333;">If you have any questions or need further assistance, please feel free to contact us.</p>
            <p style="color: #333;">Thank you for choosing our services. We appreciate your business and look forward to future opportunities to work together.</p>
        </div>
        `;
        sendEmail(
            'dunamismusiccenter.onrender.com <cherry@gmail.com>',
            `${userEnrollment.email}`,
            'Enrollment Approved',
            emailContent
        );
        const qrCodeURL = `https://dunamismusiccenter.onrender.com/enrollqrcode/${userEnrollment._id}`;

        const qrBuffer = qr.imageSync(qrCodeURL, { type: 'png' });

        const qrCodeDirectory = path.join(__dirname, '../../public/uploads/qrcode');

        if (!fs.existsSync(qrCodeDirectory)) {
            fs.mkdirSync(qrCodeDirectory, { recursive: true });
        }

        // Define the relative file path for saving the QR code image
        const relativeQrCodeFilePath = path.join('/uploads/qrcode', `${userEnrollment._id}.png`);

        const qrCodeFilePath = path.join(qrCodeDirectory, `${userEnrollment._id}.png`);

        fs.writeFileSync(qrCodeFilePath, qrBuffer);

        if (userEnrollment) {
            await Enrollement.findByIdAndUpdate(enrollementId, { qrDataURL: relativeQrCodeFilePath }, { new: true });
            console.log('Success enrollment approved');
            req.flash('message', 'Enrollment approved successfully!');
            return res.redirect('/admin/enrollment');
        } else {
            console.log('Failed enrollment approved');
            req.flash('message', 'Enrollment approved Failed!');
            return res.redirect('/admin/enrollment');
        }
    } else if (actions === 'cancel') {
        const userEnrollment = await Enrollement.findByIdAndUpdate(enrollementId, { isApproved: false }, { new: true }).populate('userId');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emonawong22@gmail.com',
                pass: 'nouv heik zbln qkhf',
            },
        });

        const sendEmail = async (from, to, subject, htmlContent) => {
            try {
                const mailOptions = {
                    from,
                    to,
                    subject,
                    html: htmlContent,
                };
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).render('500');
            }
        };
        const emailContent = `
        <div style="background-color: #e8f5e9; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff; margin-bottom: 20px;">Hello ${userEnrollment.name},</h2>
            <p style="color: #333;">We regret to inform you that your enrollment has been cancelled.</p>
            <p style="color: #333;">Due to certain reasons, we have had to cancel your enrollment for the course.</p>
            <p style="color: #333;">We apologize for any inconvenience this may cause you.</p>
            <p style="color: #333;">If you have any questions or concerns regarding this cancellation, please do not hesitate to contact us.</p>
        </div>
        `;
        sendEmail(
            'dunamismusiccenter.onrender.com <cherry@gmail.com>',
            `${userEnrollment.email}`,
            'Enrollment Approved',
            emailContent
        );
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

module.exports.statusDisapproved = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const enrollements = await Enrollement.find().populate('professorId');
            res.render('admin/enrollmentDisapproved', {
                site_title: SITE_TITLE,
                title: 'Enrollment',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                enrollements: enrollements,
                currentUrl: req.originalUrl,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin })
        }
    } else {
        return res.redirect('/login')
    }
}
module.exports.deleteDisapproved = async (req, res) => {
    const enrollementId = req.body.enrollementId;
    const enrollementToDelete = await Enrollement.findByIdAndDelete(enrollementId);
    if (enrollementToDelete) {
        console.log('enrollment Deleted');
        req.flash('message', 'Enrollment Deleted!');
        return res.redirect('/admin/enrollment/disapproved');
    } else {
        console.log('failed enrollment Deleted');
        req.flash('message', 'Enrollment Deleted Failed!');
        return res.redirect('/admin/enrollment/disapproved');
    }
}

module.exports.statusDone = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            const enrollements = await Enrollement.find().populate('professorId');
            res.render('admin/enrollmentDone', {
                site_title: SITE_TITLE,
                title: 'Enrollment',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                enrollements: enrollements,
                currentUrl: req.originalUrl,
            });
        } else {
            return res.status(404).render('404', { userLogin: userLogin })
        }
    } else {
        return res.redirect('/login')
    }
}

module.exports.deleteDone = async (req, res) => {
    const enrollementId = req.body.enrollementId;
    const enrollementToDelete = await Enrollement.findByIdAndDelete(enrollementId);
    if (enrollementToDelete) {
        console.log('enrollment Deleted');
        req.flash('message', 'Enrollment Deleted!');
        return res.redirect('/admin/enrollment/done');
    } else {
        console.log('failed enrollment Deleted');
        req.flash('message', 'Enrollment Deleted Failed!');
        return res.redirect('/admin/enrollment/done');
    }
}

module.exports.edit = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    if (userLogin) {
        if (userLogin.role === 'admin') {
            try {
                const enrollmentId = req.params.enrollmentId
                if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
                    console.log('Invalid enrollmentId:', enrollmentId);
                    return res.status(404).render('404', { userLogin: {
                        role:'admin',
                    } });
                }
                const enrollment = await Enrollement.findById(enrollmentId).populate('professorId')
                res.render('admin/enrollmentEdit', {
                    site_title: SITE_TITLE,
                    title: 'Enrollment Update',
                    enrollment: enrollment,
                    messages: req.flash(),
                    userLogin: userLogin,
                    currentUrl: req.originalUrl,
                });
            } catch (err) {
                return res
                    .status(err.status || 500)
                    .render('500', { err: err });
            }
        } else {
            return res.status(404).render('404', { userLogin: userLogin })
        }
    } else {
        return res.redirect('/login')
    }
}

module.exports.doEdit = async (req, res) => {
    const enrollmentId = req.params.enrollmentId
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
        console.log('Invalid enrollmentId:', enrollmentId);
        return res.status(404).render('404', { userLogin: {
            role:'admin',
        } });
    }
    const enrollment = await Enrollement.findById(enrollmentId)
    if (enrollment) {
        const titleChecking = await Course.findOne({ title: req.body.courseTitle })
        if (!titleChecking) {
            req.flash('message', 'Course Title does not exist.');
            return res.redirect(`/admin/enrollment/edit/${enrollment._id}`);
        }
        const enrollmentData = {
            courseId: req.body.courseId,
            courseTitle: req.body.courseTitle,
            name: req.body.name,
            email: req.body.email,
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
            isApproved: 'false',
        };
        const updatedEnrollement = await Enrollement.findByIdAndUpdate(enrollmentId, enrollmentData, {
            new: true
        })
        if (updatedEnrollement) {
            console.log('success Enrollment update');
            req.flash('message', 'Enrollment Updated');
            return res.redirect('/admin/enrollment');
        } else {
            return res
                .status(404)
                .render('404', { err: err });
        }
    } else {
        req.flash('message', 'Please check the Enrollment Id');
        return res.redirect(`/admin/enrollment`);
    }
}
