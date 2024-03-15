const adminProductController = require('../controllers/admin/productController');
const adminCourseController = require('../controllers/admin/courseController');
const adminUserController = require('../controllers/admin/userController');
const adminEnrollmentController = require('../controllers/admin/enrollmentController');

const userIndexController = require('../controllers/user/indexController');
const userProductController = require('../controllers/user/productController');
const userCourseController = require('../controllers/user/courseController');
const userCartController = require('../controllers/user/cartController');

const authLoginController = require('../controllers/auth/loginController');
const authRegisterController = require('../controllers/auth/registerController');
const authVerifyController = require('../controllers/auth/verifyController');
const authLogoutController = require('../controllers/auth/logoutController');
module.exports = function(app){
    app.get('/login', authLoginController.login);
    app.post('/doLogin', authLoginController.doLogin);
    app.post('/logout', authLogoutController.logout);
    app.get('/register', authRegisterController.register);
    app.post('/doRegister', authRegisterController.doRegister);
    app.get('/verify', authVerifyController.verify);
    app.post('/doVerify', authVerifyController.doVerify);
    //products
    app.get('/', userIndexController.index);
    app.get('/products', userProductController.index);
    app.get('/products/:category', userProductController.indexCategory);
    app.get('/product/detail/:id', userProductController.detail);
    //courses
    app.get('/courses', userCourseController.index);
    app.get('/course/enroll/:courseId', userCourseController.enroll);
    app.post('/course/doEnroll', userCourseController.doEnroll);
    //add-to-cart
    app.get('/carts', userCartController.cart);
    app.post('/cart', userCartController.addCart);
    app.post('/cartsingle', userCartController.addCartSingle);
    app.post('/cart/update/:itemId', userCartController.updateCart);
    //admin
    app.get('/admin', (req,res) => {
        res.render('admin/index', {
            req:req
        })
    })
    app.get('/admin/product', adminProductController.index);
    app.get('/admin/product/edit/:productId', adminProductController.edit);
    app.post('/admin/product/doEdit/:productId', adminProductController.doEdit);
    app.post('/admin/product/delete', adminProductController.delete);
    app.get('/admin/product/create', adminProductController.create);
    app.post('/admin/product/doCreate', adminProductController.doCreate);
    app.get('/admin/course', adminCourseController.index);
    app.get('/admin/course/edit/:courseId', adminCourseController.edit);
    app.post('/admin/course/edit/:courseId', adminCourseController.doEdit);
    app.post('/admin/course/delete', adminCourseController.delete);
    app.get('/admin/course/create', adminCourseController.create);
    app.post('/admin/course/doCreate', adminCourseController.doCreate);
    app.get('/admin/user', adminUserController.index);
    app.post('/admin/user/delete', adminUserController.delete);
    app.get('/admin/user/create', adminUserController.create);
    app.post('/admin/user/doCreate', adminUserController.doCreate);
    app.get('/admin/user/edit/:id', adminUserController.edit);
    app.post('/admin/user/doEdit/:id', adminUserController.doEdit);
    app.get('/admin/enrollment', adminEnrollmentController.index);
    app.get('/admin/enrollment/edit/:enrollmentId', adminEnrollmentController.edit);
    app.post('/admin/enrollment/doEdit/:enrollmentId', adminEnrollmentController.doEdit);
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