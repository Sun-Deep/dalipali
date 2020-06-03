const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const db = require('./config/db');
var MySQLStore = require('express-mysql-session')(session);
const isAuthenticated = require('./config/passport').isAuthenticated;
const isUser = require('./config/passport').isUser;
const isAdmin = require('./config/passport').isAdmin;
var flash = require('express-flash');
require('dotenv').config()

//const checkToken = require('./api/middleware/check-auth');
const expressHbs = require('express-handlebars')
const hbs = expressHbs.create({
    defaultLayout: 'layout',
    extname: '.hbs',
    //create helpers
    helpers: {
        ifEquals: function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },
        dec: function (value, options) {
            return parseInt(value) - 1
        },
        ifG: function (arg1, options) {
            return (arg1 > 0) ? options.fn(this) : options.inverse(this);
        },
        if_eq: function (a, b, opts) {
            if (a === b) // Or === depending on your needs
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        switch: function (arg1, arg2, options) {
            console.log(arg2);
        }
    }
})
app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')

app.use(express.static(path.join(__dirname + '/public')))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'USERS_SESSIONS',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    },
}, db);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret_asd',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000, }

}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname + '/public/img'));
app.use(express.static(__dirname + '/upload'));
app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})
app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.get('/login', (req, res, next) => {
    var a = req.session.passport;
    if (a == null) {
        req.app.locals.layout = 'fontends'
        res.render('login', { message: req.flash('msg'), error: req.flash('error') });
    }
    else {
        var role = req.session.passport.user.role;
        if (role == 1) {
            res.redirect('/');
        }
        else if (role == 0) {
            res.redirect('/dashboard');
        }
        else {
            req.app.locals.layout = 'fontends'
            res.render('login', { error: req.flash('error') })
        }
    }

})
app.get('/registerpage', (req, res, next) => {
    var a = req.session.passport;
    if (a == null) {
        req.app.locals.layout = 'fontends'
        res.render('register', { email: req.flash('email'), phone: req.flash('phone') });
    }
    else {
        var role = req.session.passport.user.role;
        if (role == 1) {
            res.redirect('/');
        }
        else if (role == 0) {
            res.redirect('/dashboard');
        }
    }

});
app.get('/index', isAuthenticated, (req, res, next) => {
    var role = req.session.passport.user.role;
    if (role == 1) {
        if (req.session.originalUrl) {
            var oldUrl = req.session.originalUrl;
            req.session.originalUrl = null;
            res.redirect(oldUrl);
        }
        else {
            res.redirect('/')
        }

    }
    else if (role == 0) {
        res.redirect('/dashboard');
    }

});
// backend
app.get('/dashboard', isAuthenticated, isAdmin, (req, res, next) => {
    req.app.locals.layout = 'layout'
    res.render('backends/dashboardpage')
})
///-------- Count order,packaging-----------/////
app.get('/NewOrder', isAuthenticated, isAdmin, (req, res) => {
    const a = 1;
    db.query('SELECT COUNT(status) as cnt FROM `order_table` WHERE status= ?', [a], (error, result) => {
        if (error) { console.log(error) }
        var a = result[0].cnt

        res.status(200).json({
            count: a
        })
    })
});
app.get('/Processing', isAuthenticated, isAdmin, (req, res) => {
    const a = 2;
    db.query('SELECT COUNT(status) as cnt FROM `order_table` WHERE status= ?', [a], (error, result) => {
        if (error) { console.log(error) }
        var a = result[0].cnt
        res.status(200).json({
            count: a
        })
    })
});
app.get('/Shipping', isAuthenticated, isAdmin, (req, res) => {
    const a = 3;
    db.query('SELECT COUNT(status) as cnt FROM `order_table` WHERE status= ?', [a], (error, result) => {
        if (error) { console.log(error) }
        var a = result[0].cnt
        res.status(200).json({
            count: a
        })
    })
});
app.get('/Pending', isAuthenticated, isAdmin, (req, res) => {
    const a = 4;
    db.query('SELECT COUNT(status) as cnt FROM `order_table` WHERE status= ?', [a], (error, result) => {
        if (error) { console.log(error) }
        var a = result[0].cnt
        res.status(200).json({
            count: a
        })
    })
});
app.get('/Cencelled', isAuthenticated, isAdmin, (req, res) => {
    const a = 5;
    db.query('SELECT COUNT(status) as cnt FROM `order_table` WHERE status= ?', [a], (error, result) => {
        if (error) { console.log(error) }
        var a = result[0].cnt
        res.status(200).json({
            count: a
        })
    })
});
app.get('/Delivered', isAuthenticated, isAdmin, (req, res) => {
    const a = 0;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    db.query('SELECT COUNT(status) as cnt FROM `order_table` WHERE status= ? AND delivery_date=?', [a, date], (error, result) => {
        if (error) { console.log(error) }
        var a = result[0].cnt
        res.status(200).json({
            count: a
        })
    })
});
// ------------------ Add,view city-----------------------//
app.get('/addCity', isAuthenticated, isAdmin, (req, res) => {
    req.app.locals.layout = 'layout'
    res.render('backends/city/addCity', { title: 'Add city', msg: req.flash('msg'), error: req.flash('error') })
});
app.get('/viewCity', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM city_table', (error, result) => {
        req.app.locals.layout = 'layout'
        res.render('backends/city/viewCity', { title: 'Add city', result: result })
    })
});
// --------------ADD Category,ViewCategory----------------------
app.get('/addCategory', isAuthenticated, isAdmin, (req, res) => {
    req.app.locals.layout = 'layout'
    res.render('backends/addcategory', { title: 'Add Category', msg: req.flash('msg'), error: req.flash('error') })
});
app.get('/viewCategory', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM category_table', (error, result) => {
        req.app.locals.layout = 'layout'
        res.render('backends/viewcategory', { title: 'View Category', result: result })
    })

});
// ------------Add View edit product Item-------------
app.get('/addProduct', isAuthenticated, isAdmin, (req, res) => {
    const status = 1;
    db.query('SELECT * FROM category_table WHERE status=?', [status], (error, result) => {
        req.app.locals.layout = 'layout'

        res.render('backends/addproduct', { title: 'Add Product', result: result, msg: req.flash('msg') });
    })
});
app.get('/viewProduct', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM category_table', (error, result) => {
        req.app.locals.layout = 'layout'
        res.render('backends/viewProduct/viewproduct', { result: result, title: 'View Product', subTitle: 'Mike & Dairy Product' });
    });

});
app.get('/Viewproduct/:id', isAuthenticated, isAdmin, (req, res) => {
    const id = req.params.id;
    db.query('SELECT category_name FROM category_table WHERE  category_id=?', [id], (error, title) => {
        db.query('SELECT * FROM product_table WHERE category_id =?', [id], (error, result) => {
            console.log(result);
            req.app.locals.layout = 'layout'
            res.render('backends/viewProduct/vegetable', { result: result, subtitle: title, title: 'View Product' });
        })
    });
})

/////////////////////
//////-------------- TO add ,viwe ... sock item -----------///
app.get('/Addstock', isAuthenticated, isAdmin, (req, res, next) => {
    const status = 1;
    db.query('SELECT product_id ,product_name from product_table LEFT JOIN stock_table USING(product_id) WHERE stock_table.product_id IS NULL AND product_table.status=?', [status], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/addstock', { result: result, title: 'Add Stock', msg: req.flash('msg') });

    })
})
//------Milk&dairy Product view Stock and edit stock--------------//
app.get('/viewStock', isAuthenticated, isAdmin, (req, res, next) => {
    db.query('SELECT * FROM category_table', (error, result) => {
        req.app.locals.layout = 'layout'
        res.render('backends/viewStock/viewstocks', { result: result, title: 'View Stock' });
    });
})
app.get('/ViewStock/(:id)', isAuthenticated, isAdmin, (req, res, next) => {
    const id = req.params.id;
    db.query('SELECT category_name FROM category_table WHERE  category_id=?', [id], (error, title) => {
        db.query('SELECT stock_table.stock_id ,stock_table.product_id ,stock_table.amount,stock_table.status,product_table.category_id,product_table.product_name,product_table.image FROM stock_table INNER JOIN product_table ON stock_table.product_id = product_table.product_id WHERE product_table.category_id = ?', [id], (error, result) => {
            if (error) console.log(error);
            req.app.locals.layout = 'layout'
            res.render('backends/viewStock/viewstock', { result: result, title: 'ViewStock', subTitle: title, msg: req.flash('msg') });
        })
    })
})

//////////////-------Viewing Order ,processing etc--------------------------///////
app.get('/viewBill/(:id)/:name', isAuthenticated, isAdmin, (req, res, next) => {
    const id = req.params.id;
    db.query('SELECT order_table.order_id, order_table.status, order_table.user_id,order_table.date,order_table.time, order_table.phone,order_table.city,order_table.state,order_table.phone,ordered_table.product_name,ordered_table.qty,ordered_table.price,ordered_table.rate,ordered_table.total,user_table.fullname FROM order_table INNER JOIN ordered_table ON order_table.order_id=ordered_table.order_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.order_id=?', [id], (error, result) => {
        if (error) { console.log(error) }
        //console.log(result)
        req.app.locals.layout = 'layout'
        var a = JSON.parse(JSON.stringify(result[0].product_name));
        var b = JSON.parse(JSON.stringify(result[0].qty));
        var c = JSON.parse(JSON.stringify(result[0].price));
        var d = JSON.parse(JSON.stringify(result[0].rate));
        var totalPrice = result[0].total;
        var status = result[0].status;
        var shipping_id = result[0].order_id;
        var date = result[0].date;
        var city = result[0].city;
        var state = result[0].state;
        var fullname = result[0].fullname;
        var phone = result[0].phone;
        res.render('backends/billingView', { status: status, product: JSON.parse(a), qty: JSON.parse(b), price: JSON.parse(c), rate: JSON.parse(d), totalPrice: totalPrice, shipping_id: shipping_id, date: date, city: city, state: state, fullname: fullname, phone: phone });
    })
})
app.get('/viewOrder', isAuthenticated, isAdmin, (req, res) => {
    const status = 1;
    db.query('SELECT user_table.fullname,order_table.status,order_table.order_id,order_table.user_id,order_table.date,order_table.time,order_table.city,order_table.state,order_table.phone,order_table.name,city_table.city_name FROM order_table INNER JOIN city_table ON order_table.city = city_table.city_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.status= ?', [status], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/orderView', { title: 'View Order', result: result });

    })
});
app.get('/ProcessingOrder', isAuthenticated, isAdmin, (req, res) => {
    const status = 2;
    db.query('SELECT user_table.fullname,order_table.status,order_table.order_id,order_table.user_id,order_table.date,order_table.time,order_table.city,order_table.state,order_table.phone,order_table.name,city_table.city_name FROM order_table INNER JOIN city_table ON order_table.city = city_table.city_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.status= ?', [status], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/process', { title: 'Process', result: result });

    })
});
app.get('/ShippingOrder', isAuthenticated, isAdmin, (req, res) => {
    const status = 3;
    db.query('SELECT user_table.fullname,order_table.status,order_table.order_id,order_table.user_id,order_table.date,order_table.time,order_table.city,order_table.state,order_table.phone,order_table.name,city_table.city_name FROM order_table INNER JOIN city_table ON order_table.city = city_table.city_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.status= ?', [status], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/shipped', { title: 'Shipped', result: result });

    })
})
app.get('/PendingOrder', isAuthenticated, isAdmin, (req, res, next) => {
    const status = 4;
    db.query('SELECT user_table.fullname,order_table.status,order_table.order_id,order_table.user_id,order_table.date,order_table.time,order_table.city,order_table.state,order_table.phone,order_table.name,city_table.city_name FROM order_table INNER JOIN city_table ON order_table.city = city_table.city_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.status= ?', [status], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/orderpending', { title: 'OrderPending', result: result });
    })
});
app.get('/CencellingOrder', isAuthenticated, isAdmin, (req, res, next) => {
    const status = 5;
    db.query('SELECT user_table.fullname,order_table.status,order_table.order_id,order_table.user_id,order_table.date,order_table.time,order_table.city,order_table.state,order_table.phone,order_table.name,city_table.city_name FROM order_table INNER JOIN city_table ON order_table.city = city_table.city_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.status= ?', [status], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/cencelled', { title: 'CencelledOrder', result: result });
    })
});
app.get('/DeliveredOrder', isAuthenticated, isAdmin, (req, res, next) => {
    const status = 0;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    db.query('SELECT user_table.fullname,order_table.delivery_date,order_table.status,order_table.order_id,order_table.user_id,order_table.date,order_table.time,order_table.city,order_table.state,order_table.phone,order_table.name,city_table.city_name FROM order_table INNER JOIN city_table ON order_table.city = city_table.city_id INNER JOIN user_table ON order_table.user_id = user_table.user_id WHERE order_table.status= ? AND  order_table.delivery_date=?', [status, date], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'layout'
        res.render('backends/delivered', { title: 'Delivered', result: result });
    })
})


////////////////////////////////////
const Cart = require('./model/cart');
//----- fontend---------//
//homepage////
app.get('/', (req, res, next) => {
    var a = req.session.passport;
    if (a == null) {
        const status = 1;
        const category_id = 1;
        db.query('SELECT * FROM `product_table` WHERE status=? AND category_id=? ORDER BY product_id DESC LIMIT 4', [status, category_id], (error, result) => {
            if (error) console.log(error);
            req.app.locals.layout = 'fontends'
            res.render('fontends/homepages', { result: result });
        })
    }
    else {
        var role = req.session.passport.user.role;
        if (role == 1) {
            const status = 1;
            const category_id = 1;
            db.query('SELECT * FROM `product_table` WHERE status=? AND category_id=? ORDER BY product_id DESC LIMIT 4', [status, category_id], (error, result) => {
                if (error) console.log(error);
                req.app.locals.layout = 'fontends'
                res.render('fontends/homepages', { result: result });
            })
        }
        else if (role == 0) {
            res.redirect('/dashboard');
        }
    }


});
app.get('/vegetable', (req, res, next) => {
    const status = 1;
    category_id = 3;
    db.query('SELECT * FROM `product_table` WHERE status=? AND category_id=? ORDER BY product_id DESC LIMIT 3', [status, category_id], (error, result) => {
        if (error) console.log(error);
        res.status(200).json({
            result: result
        })
    })
})
app.get('/dal&pulse', (req, res, next) => {
    const status = 1;
    const category_id = 2;
    db.query('SELECT * FROM `product_table` WHERE status=? AND category_id=? ORDER BY product_id DESC  LIMIT 3', [status, category_id], (error, result) => {
        if (error) console.log(error);
        res.status(200).json({
            result: result
        })
    })
})
app.get('/product_view', (req, res) => {
    const status = 1;
    db.query('SELECT * FROM `product_table` WHERE status=?', [status], (error, result) => {
        req.app.locals.layout = 'fontends'
        res.render('fontends/product', { result: result });
    })
})
app.get('/product_view/(:id)', (req, res, next) => {
    // if (!req.session.cart) {
    //     var c = null;
    // }
    // else {
    //     const a = (req.session.cart.items);
    //     var c = [];
    //     Object.keys(a).forEach(function (key) {
    //         const b = a[key].item;
    //         Object.keys(b).forEach(function (key) {
    //             c.push(b[key].product_id)
    //         })
    //     });
    // }
    const category_id = req.params.id;
    const status = 1;
    db.query('SELECT * FROM `product_table` WHERE status=? AND category_id=?', [status, category_id], (error, result) => {
        if (error) console.log(error);
        req.app.locals.layout = 'fontends'
        res.render('fontends/product', { result: result });
    })
});
app.get('/product/removeAll', (req, res, next) => {
    delete req.session.cart;
    res.redirect('/cart-view');
})
app.get('/product/addcart/(:id)', (req, res, next) => {
    const productId = req.params.id;
    const status = 1;
    const value = 0;
    db.query('SELECT * FROM `stock_table` WHERE product_id=? AND (status=? AND amount > ? )', [productId, status, value], (error, result) => {
        if (error) console.log(error)
        console.log(result);
        if (result.length > 0) {
            const cart = new Cart(req.session.cart ? req.session.cart : {});
            if (!req.session.cart) {
                db.query('SELECT product_id,product_name,price FROM `product_table` WHERE product_id =?', [productId], (error, product) => {
                    if (error) return res.redirect('/homepage')
                    const product_id = product[0].product_id;
                    cart.add(product, product_id);
                    req.session.cart = cart;
                    totalQtyProduct = req.session.cart.totalQty;
                    res.status(200).json({
                        totalcart: totalQtyProduct
                    })
                })
            } else {
                if (req.session.cart != null) {
                    var a = req.session.cart.items;
                    var product_id = [];
                    Object.keys(a).forEach(function (key) {
                        const b = a[key].item;
                        Object.keys(b).forEach(function (key) {
                            product_id.push(b[key].product_id)
                        })
                    });
                    const result = (element) => element == productId;
                    var check = product_id.some(result);
                    if (check == true) {
                        res.status(200).json({
                            message: true
                        })
                    }
                    else {
                        db.query('SELECT product_id,product_name,price FROM `product_table` WHERE product_id =?', [productId], (error, product) => {
                            if (error) return res.redirect('/homepage')
                            const product_id = product[0].product_id;
                            cart.add(product, product_id);
                            req.session.cart = cart;
                            totalQtyProduct = req.session.cart.totalQty;
                            res.status(200).json({
                                totalcart: totalQtyProduct,

                            })
                        })
                    }

                }
            }
        }
        else {
            res.status(200).json({
                message1: 'No item'
            })
        }
    })

});
app.get('/reduce/:id', (req, res, next) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByone(productId);
    req.session.cart = cart;
    res.redirect('/cart-view');
});

app.get('/add/:id', (req, res, next) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.addByone(productId);
    req.session.cart = cart;
    res.redirect('/cart-view');
});

app.get('/cart-view', (req, res) => {
    if (!req.session.cart) {
        req.app.locals.layout = 'fontends'
        //console.log(req.flash('msg'));
        return res.render('fontends/cartview', { product: null, message: req.flash('msg') })
    }
    else {
        var cart = new Cart(req.session.cart);
        res.app.locals.layout = 'fontends'
        return res.render('fontends/cartview', { product: cart.generateArray(), totalPrice: cart.totalPrice });
    }
});


app.get('/checkOut', isAuthenticated, isUser, (req, res) => {
    if (!req.session.cart) {
        res.redirect('/cart-view');
    }
    else {
        const user_id = (req.session.passport.user.id);
        db.query('SELECT * FROM order_table WHERE user_id = ?  ORDER BY date DESC', [user_id], (error, prev) => {
            if (error) { console.log(error) }
            req.app.locals.layout = 'fontends'
            if (prev == '') {
                const status =1;
                db.query('SELECT * FROM city_table WHERE status=?',[status], (error,result) => {
                res.render('fontends/checkout', {city:null ,result:result});
                })
            }
            else {
                const status = 1;
                db.query('SELECT * FROM city_table WHERE status=?',[status], (error,result) => {
                    const phone = prev[0].phone;
                    const city = prev[0].city;
                    console
                    res.render('fontends/checkout', { phone: phone, city: city ,result:result });
                })
            }

        })
    }
});

app.get('/contactUs', isAuthenticated, isUser, (req, res) => {
    req.app.locals.layout = 'fontends'
    res.render('fontends/contactus');
});
app.get('/history', isAuthenticated, isUser, (req, res) => {
    req.app.locals.layout = 'fontends'
    res.render('fontends/history')
});
app.get('/category', (req, res) => {
    db.query('SELECT * FROM category_table ', (error, result) => {
        if (error) console.log(error);
        res.status(200).json({
            result: result
        })
    })
});
app.get('/guestuser', (req, res) => {
    if (!req.session.cart) {
        res.redirect('/cart-view');
    }
    else {
        const status = 1;
        db.query('SELECT * FROM `city_table` WHERE status = ?', [status], (error, result) => {
            if (error) { console.log(error) }
            req.app.locals.layout = 'fontends'
            res.render('fontends/guestusercheckout', { result: result })
        })
    }
})
app.get('/moreDetail/(:id)', (req, res) => {
    req.app.locals.layout = 'fontends'
    res.render('fontends/moredetail')
})
const userRoutes = require('./api/routes/userroute');
const productRoutes = require('./api/routes/product');

const subscriptionRoute = require('./api/routes/subscription')
app.use('/subscription', subscriptionRoute)
// // rest api 

// const car_infoRoutes = require('./api/routes/carview');
app.use((req, res, next) => {
    res.header("Access-control-Allow-orgin", "*");
    res.header(
        "Access-Control-Allow-Header",
        "Origin,X-Request-with,Content-Type,Accept,Authorization",
    );

    if (res.method === 'OPTIONS') {
        res.header('Access-control-Allow-Method', 'PUT, POST ,GET,PATCH,DELETE ');
        return res.status(200).json({});
    }
    next();
});

app.use('/auth', userRoutes);
app.use('/product', productRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status = error.status || 500;
    res.json({
        error: {
            message: error.message
        }
    });
    next();
});
module.exports = app;