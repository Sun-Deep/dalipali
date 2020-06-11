
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

router.route('/acceptRequest/:id')
    .get(isAuthenticated, isAdmin, subscriptionController.acceptRequest)

router.route('/deleteRequest/:id')
    .get(isAuthenticated, isAdmin, subscriptionController.deleteRequest)

router.route('/viewSubscriptions')
    .get(isAuthenticated, isAdmin, subscriptionController.viewSubscriptions)

router.route('/details/:id')
    .get(isAuthenticated, isAdmin, subscriptionController.subscriptionDetails)

router.route('/deliver')
    .post(isAuthenticated, isAdmin, subscriptionController.deliver)

router.route('/editDeliverStatus')
    .post(isAuthenticated, isAdmin, subscriptionController.editDeliverStatus)
module.exports = router