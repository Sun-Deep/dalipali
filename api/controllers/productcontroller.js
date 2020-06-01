const db = require('../../config/db');
module.exports = {
    //-----------------Place Add,Status-----------------------------//
    placeCreater: (req, res, next) => {
        const { place } = req.body;
        db.query('SELECT * FROM city_table WHERE city_name=?', [place], (error, result) => {
            console.log(result)
            if (result.length >0) {
                req.flash('error',place)
                res.redirect('/addCity')
            }
            else{
                status = 0;
                db.query('INSERT INTO city_table(city_name,status) VALUES (?,?)', [place, status], (error, result) => {
                    if (error) {console.log(error)}
                    req.flash('msg','Place have added')
                    res.redirect('/addCity')
                })
               
            }

        })
    },
    placeStatus:(req,res)=>{
     const city_id = req.params.id;
     const {status}=req.body;
     db.query('UPDATE city_table SET status=? WHERE city_id=? ', [status, city_id], (error, result) => {
        if (error) console.log(error);
        res.redirect('/viewCity');
    })
    },
    //-----------------Category Add,Status-----------------------------//
    categoryCreater: (req, res, next) => {
        const { category } = req.body;
        db.query('INSERT INTO category_table(category_name) VALUES (?)', [category], (error, result) => {
            if (error) console.log(error)
            req.flash('msg', ' Category have added ')
            res.redirect('/addCategory')
        })
    },
    categoryStatus: (req, res, next) => {
        const category_id = req.params.id;
        const { status } = req.body;
        db.query('UPDATE category_table SET status=? WHERE category_id=? ', [status, category_id], (error, result) => {
            if (error) console.log(error);
            res.redirect('/viewCategory');
        })
    },
    //-----------------product Add,Status-----------------------------//
    productCreater: (req, res, next) => {
        const { productname, price, status, category_id } = req.body;
        const image = req.file.filename;
        db.query('INSERT INTO product_table(product_name,image,price,category_id,status)VALUES(?,?,?,?,?)', [productname, image, price, category_id, status], (error, result) => {
            if (error) console.log(error);
            req.flash('msg', productname)
            res.redirect('/addProduct');
        });
    },
    productStatus: (req, res, next) => {
        const { status, type } = req.body;
        const product_id = req.params.id;
        db.query('UPDATE product_table SET status=? WHERE product_id=? ', [status, product_id], (error, result) => {
            if (error) console.log(error);
            res.redirect('/viewproduct/' + type);
        })
    },
    productEdit: (req, res, next) => {
        const { price, type } = req.body;
        const prices = parseFloat(price);
        const product_id = req.params.id;
        db.query('UPDATE product_table SET price=? WHERE product_id=? ', [prices, product_id], (error, result) => {
            if (error) console.log(error);
            res.redirect('/viewproduct/' + type);
        })
    },
    //--------------Stock ADD ,VIEW,status--------------
    stockCreater: (req, res, next) => {
        const product_id = req.body.product;
        const { quantity, status } = req.body;
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        db.beginTransaction(function (error) {
            if (error) { console.log(error) }
            db.query('INSERT INTO stock_table(product_id,amount,status)VALUES(?,?,?)', [product_id, quantity, status], (error, result) => {
                if (error) {
                    db.rollback(function () {
                        throw (error);
                    })
                }
                db.query('INSERT INTO add_stock(product_id,amount,date) VAlUES (?,?,?)', [product_id, quantity, date], (error, result) => {
                    if (error) {
                        db.rollback(function () {
                            throw error;
                        })
                    }
                    db.commit(function (error) {
                        if (error) {
                            db.rollback(function () {
                                throw error;
                            })
                        }
                        req.flash('msg', 'ADD');
                        return res.redirect('/addStock');
                    })
                })
            })
        })
    },
    stockStatus: (req, res, next) => {
        const stock_id = req.params.id;
        const { status, type } = req.body;
        db.query('UPDATE stock_table SET status=? WHERE stock_id=?', [status, stock_id], (error, result) => {
            if (error) { console.log(error) }
            res.redirect('/ViewStock/' + type);
        })
    },
    stockEdit: (req, res, next) => {
        const { amount_first, amount_second, type, name } = req.body;
        console.log(amount_first);
        console.log(amount_second);
        const stock_id = req.params.id;
        const { product_id } = req.body;
        const totalAmount = parseInt(amount_first) + parseInt(amount_second);
        console.log(totalAmount)
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        db.beginTransaction(function (error) {
            if (error) { console.log(error) }
            db.query('UPDATE stock_table SET amount=? WHERE stock_id=? ', [totalAmount, stock_id], (error, result) => {
                if (error) {
                    db.rollback(function () {
                        throw (error);
                    })
                }
                db.query('INSERT INTO add_stock(product_id,amount ,date) VAlUES (?,?,?)', [product_id, parseInt(amount_second), date], (error, result) => {
                    if (error) {
                        db.rollback(function () {
                            throw error;
                        })
                    }
                    db.commit(function (error) {
                        if (error) {
                            db.rollback(function () {
                                throw error;
                            })
                        }

                    })
                })
            })
        })

        req.flash('msg', name)
        res.redirect('/viewStock/' + type);

    },
    //--------------------New Order,Process,Shipped,Deliverrd,Pending Status Change------//;
    orderStatus: (req, res, next) => {
        const { status, type } = req.body;
        const order_id = req.params.id;
        if (type == 'ready') {
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            db.query('UPDATE order_table SET status=?,delivery_date=? WHERE order_id=? ', [status, date, order_id], (error, result) => {
                if (error) { console.log(error) }
                res.redirect('/ShippingOrder');
            })
        }
        else {
            db.query('UPDATE order_table SET status=? WHERE order_id=? ', [status, order_id], (error, result) => {
                if (error) console.log(error);
                if (type == 'order') {
                    res.redirect('/viewOrder');
                }
                else if (type == 'package') {
                    res.redirect('/ProcessingOrder');
                }
                else if (type == 'pending') {
                    res.redirect('/PendingOrder');
                }
                else if (type == 'cenceling') {
                    res.redirect('/CencellingOrder');
                }
            })
        }
    },
    //----------------  User order Router------------------
    geustuserOrder: (req, res) => {
        if (!req.session.cart) {
            res.redirect('/')
        }
        else {
            const { city, address, phone, name } = req.body;
            console.log(req.body);
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            const a = (req.session.cart.items);
            const user_id = 0;
            var product_name = [];
            var qty = [];
            var price = [];
            var product_id = [];
            var rate = [];
            var totalprice = req.session.cart.totalPrice;
            Object.keys(a).forEach(function (key) {
                qty.push(a[key].qty);
                price.push(a[key].price);
                const b = a[key].item;
                Object.keys(b).forEach(function (key) {
                    product_name.push(b[key].product_name);
                    product_id.push(b[key].product_id)
                    rate.push(b[key].price)
                })
            });
            db.query('INSERT INTO order_table(user_id,date,time,city,state,phone,name) VALUES(?,?,?,?,?,?,?)', [user_id, date, time, city, address, phone, name], (error, result) => {
                if (error) { console.log(error) }
                const order_id = result.insertId;
                db.query('INSERT INTO ordered_table(order_id,product_name,qty,price,rate,total) VALUES(?,?,?,?,?,?)', [order_id, JSON.stringify(product_name), JSON.stringify(qty), JSON.stringify(price), JSON.stringify(rate), totalprice], (error, result) => {
                    if (error) { console.log(error) }
                    for (var i = 0, j = 0; i < product_id.length, j < qty.length; i++ , j++) {
                        var a = product_id[i];
                        var b = qty[j]
                        db.query('SELECT  stock_id,amount FROM `stock_table` WHERE product_id =?', [a], (error, result) => {
                            if (error) { console.log(error) }
                            var stock_id = result[0].stock_id
                            var amount = result[0].amount;
                            var final = amount - b;
                            db.query('UPDATE stock_table SET amount=? WHERE stock_id=?', [final, stock_id], (error, result) => {
                                if (error) { console.log(error) }

                            })
                        })
                    }


                })
                delete req.session.cart;
                req.flash('msg', 'Your order received. You will get a call for confirmation.');
                res.redirect('/cart-view');
            })

        }
    },
    userOrder: (req, res, next) => {
        if (!req.session.cart) {
            res.redirect('/')
        }
        else {
            const { city, address, phone } = req.body;
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            const a = (req.session.cart.items);
            const user_id = req.session.passport.user.id;
            var product_name = [];
            var qty = [];
            var price = [];
            var product_id = [];
            var rate = [];
            var totalprice = req.session.cart.totalPrice;
            Object.keys(a).forEach(function (key) {
                qty.push(a[key].qty);
                price.push(a[key].price);
                const b = a[key].item;
                Object.keys(b).forEach(function (key) {
                    product_name.push(b[key].product_name);
                    product_id.push(b[key].product_id)
                    rate.push(b[key].price)
                })
            });
            db.query('INSERT INTO order_table(user_id,date,time,city,state,phone) VALUES(?,?,?,?,?,?)', [user_id, date, time, city, address, phone], (error, result) => {
                if (error) { console.log(error) }
                const order_id = result.insertId;
                db.query('INSERT INTO ordered_table(order_id,product_name,qty,price,rate,total) VALUES(?,?,?,?,?,?)', [order_id, JSON.stringify(product_name), JSON.stringify(qty), JSON.stringify(price), JSON.stringify(rate), totalprice], (error, result) => {
                    if (error) { console.log(error) }
                    for (var i = 0, j = 0; i < product_id.length, j < qty.length; i++ , j++) {
                        var a = product_id[i];
                        var b = qty[j]
                        db.query('SELECT  stock_id,amount FROM `stock_table` WHERE product_id =?', [a], (error, result) => {
                            if (error) { console.log(error) }
                            var stock_id = result[0].stock_id
                            var amount = result[0].amount;
                            var final = amount - b;
                            db.query('UPDATE stock_table SET amount=? WHERE stock_id=?', [final, stock_id], (error, result) => {
                                if (error) { console.log(error) }

                            })
                        })
                    }


                })
                delete req.session.cart;
                req.flash('msg', 'Your order received. You will get a call for confirmation.');
                res.redirect('/cart-view');
            })

        }
    }



}