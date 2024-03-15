const adminProductController = require('../controllers/admin/productController');
const adminCourseController = require('../controllers/admin/courseController');
const adminUserController = require('../controllers/admin/userController');
const adminEnrollmentController = require('../controllers/admin/enrollmentController');

const userProductController = require('../controllers/user/productController');
const userCourseController = require('../controllers/user/courseController');


const authLoginController = require('../controllers/auth/loginController');
const authRegisterController = require('../controllers/auth/registerController');
const authVerifyController = require('../controllers/auth/verifyController');
module.exports = function(app){
    app.get('/', (req,res) => {
        res.render('index',{
            req:req,
        })
    })
    app.get('/login', authLoginController.login);
    app.post('/doLogin', authLoginController.doLogin);
    app.get('/register', authRegisterController.register);
    app.post('/doRegister', authRegisterController.doRegister);
    app.get('/verify', authVerifyController.verify);
    app.post('/doVerify', authVerifyController.doVerify);
    
    //products
    app.get('/products', userProductController.index);
    app.get('/products/:category', userProductController.indexCategory);
    app.get('/product/detail/:id', userProductController.detail);
    //courses
    app.get('/courses', userCourseController.index);
    app.get('/course/enroll/:courseId', userCourseController.enroll);
    app.post('/course/doEnroll', userCourseController.doEnroll);

    
    //admin
    app.get('/admin', (req,res) => {
        res.render('admin/index',{
            req:req
        })
    })
    app.get('/admin/product', adminProductController.index);
    app.post('/admin/product/delete', adminProductController.delete);
    app.get('/admin/product/create', adminProductController.create);
    app.post('/admin/product/doCreate', adminProductController.doCreate);
    app.get('/admin/course', adminCourseController.index);
    app.get('/admin/course/create', adminCourseController.create);
    app.post('/admin/course/doCreate', adminCourseController.doCreate);
    app.get('/admin/user', adminUserController.index);
    app.post('/admin/user/delete', adminUserController.delete);
    app.get('/admin/user/create', adminUserController.create);
    app.post('/admin/user/doCreate', adminUserController.doCreate);
    app.get('/admin/enrollment', adminEnrollmentController.index);
    app.post('/admin/enrollment', adminEnrollmentController.actions);
    app.get('/admin/enrollment/create', adminEnrollmentController.create);
    app.post('/admin/enrollment/doCreate', adminEnrollmentController.doCreate);
    app.get('/admin/enrollment/approved', adminEnrollmentController.statusApproved);
    app.post('/admin/enrollment/deleteApproved', adminEnrollmentController.deleteApproved);
    app.get('/admin/enrollment/disapproved', adminEnrollmentController.statusDisapproved);
    app.post('/admin/enrollment/deleteDisapproved', adminEnrollmentController.deleteDisapproved);
    app.get('/admin/enrollment/done', adminEnrollmentController.statusDone);
    app.post('/admin/enrollment/deleteDone', adminEnrollmentController.deleteDone);
    
}