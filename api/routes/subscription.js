
const router = require('express').Router()
const subscriptionController = require('../controllers/subscription.controller')

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'fontends'
    next()
})

router.route('/')
    .get((req, res) => {
        res.render('fontends/sub_landing')
    })

router.route('/trial')
    .get(subscriptionController.takeTrail)
    .post(subscriptionController.registerTrail)
    




module.exports = router