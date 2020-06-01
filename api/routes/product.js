const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productcontroller');


const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cd(null, './upload/');
    },
    filename: function (req, file, cd) {

        cd(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cd) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cd(null, true);
    } else {
        cd(null, false);
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

// --------------add edit and status product---------
router
    .route('/')
    .post(upload.single('image'), productController.productCreater);
router
    .route('/productStatus/:id')
    .post(productController.productStatus)
router
    .route('/product_edit/:id')
    .post(productController.productEdit)
// -------------end------------------------


//------------------add category-----------
router
    .route('/addCategory')
    .post(productController.categoryCreater)
router
    .route('/categoryStatus/:id')
    .post(productController.categoryStatus)
//------------------add Place-----------
router
    .route('/addPlace')
    .post(productController.placeCreater)
router
    .route('/placeStatus/:id')
    .post(productController.placeStatus)
// -------------end------------------------
//------------------add,editstatus Stock-----------
router
    .route('/addStock')
    .post(productController.stockCreater)
router
    .route('/orderStatus/:id')
    .post(productController.orderStatus)

router
    .route('/stockStatus/:id')
    .post(productController.stockStatus)
router
    .route('/stock_edit/:id')
    .post(productController.stockEdit)
//--------------User Order Routes------------
router
    .route('/order')
    .post(productController.userOrder)

router
    .route('/guestorder')
    .post(productController.geustuserOrder)

module.exports = router;