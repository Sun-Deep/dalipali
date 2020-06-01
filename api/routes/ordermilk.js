const express = require('express');
const app = express();
const router = express.Router();
const milkController = require('../controllers/usercontroller');

router
    .route('/')
    .post(milkController.milkCreater)
module.exports = router;