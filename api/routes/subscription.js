
const router = require('express').Router()
const subscriptionController = require('../controllers/subscription.controller')
const isAuthenticated = require('../../config/passport').isAuthenticated;
const isAdmin = require('../../config/passport').isAdmin;


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'fontends'
    next()
})

router.route('/')
    .get((req, res) => {
        res.render('fontends/sub_landing')
    })

router.route('/trial')
    .get(subscriptionController.takeTrial)
    .post(subscriptionController.registerTrial)
    
router.route('/trailRequest')
    .get(isAuthenticated, isAdmin, subscriptionController.viewTrialRequest)

router.route('/acceptTrial/:id')
    .get(isAuthenticated, isAdmin, subscriptionController.acceptTrial)

router.route('/deleteTrial/:id')
    .get(isAuthenticated, isAdmin, subscriptionController.deleteTrial)

router.route('/viewTrial')
    .get(isAuthenticated, isAdmin, subscriptionController.viewTrial)

router.route('/trial/:id')
    .get(isAuthenticated, isAdmin, subscriptionController.trialDetails)

router.route('/deliverTrial')
    .post(isAuthenticated, isAdmin, subscriptionController.deliverTrial)

router.route('/deliverStatus/:id/:status')
    .get(isAuthenticated, isAdmin, subscriptionController.changeDeliverStatus)

router.route('/subscribeRequest')
    .get(isAuthenticated, subscriptionController.loadSubscribeRequest)
    .post(isAuthenticated, subscriptionController.subscribeRequest)

router.route('/request')
    .get(isAuthenticated, isAdmin, subscriptionController.viewSubscribeRequest)

module.exports = router