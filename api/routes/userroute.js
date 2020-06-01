const express = require('express');
const app = express();
const router = express.Router();
const passport = require('passport');
require('../../config/passport');
const userController = require('../controllers/usercontroller');

router
    .post('/signup',function (req, res, next) {
    passport.authenticate('local-sign', {
        failureRedirect: '/registerpage',
        successRedirect:'/index',
        session: true,
        failureFlash: true
    })(req, res, next);
})
    // .post(userController.userCreater)
router
    .route('/login')
    .post(userController.logCheck)
router
    .route('/phone')
    .post(userController.phoneCreater)
router
    .post('/check/login', function (req, res, next) {
        passport.authenticate('local-login', {
            failureRedirect: '/login',
            successRedirect:'/index',
            session: true,
            failureFlash: true
        })(req, res, next);
    });
router
    .get('/logout', function (req, res) {
        console.log(req.session.url);
        req.logout();
        delete req.session.passport;
        delete req.session.cart;
        res.redirect('/');
    });
    router
    .get('/logout/:id', function (req, res) {
        req.logout();
        delete req.session.passport;
        delete req.session.cart;
        res.redirect('/');
    });

module.exports = router;