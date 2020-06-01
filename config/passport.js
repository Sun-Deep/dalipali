const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');
const bcrypt = require('bcrypt');
//store user id in session
passport.serializeUser(function (user, done) {
    var sessionUser = { id:user.user_id, role: user.role }
    done(null, sessionUser);

})
//retrieve user id from session
passport.deserializeUser(function (id, done) {
    db.query('SELECT * FROM user_table WHERE user_id', [id], function (err, user) {
        if (err) console.log(err);
        done(err, user[0]);
    })

});

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        db.query('SELECT * FROM user_table WHERE email=?', [email], function (err, user) {
            //console.log(a);
            if (err) return done(err);
            if (user.length == 0) {
                return done(null, false, req.flash('error', 'Email or Password inValid'));
            }
            bcrypt.compare(password, user[0].password, (err, isMatch) => {
                if (err) return err;
                if (!isMatch) {
                    return done(null, false, req.flash('error', 'Email or Password inValid'));
                }
                return done(null, user[0]);
            });
        });
    },

));
passport.use('local-sign', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    nameField: 'fullname',
    passReqToCallback: true
},
    function (req, email, password, done) {
        db.query('SELECT * FROM user_table WHERE email=?', [email], function (err, user) {
            if (err) return done(err);
            if (user.length) {
                console.log('error')
                return done(null, false, req.flash('error', 'Email is Invalid'));
            }
            hash = bcrypt.hashSync(password, 10);
            const passwords = hash;
            const { fullname } = req.body;
            var user = new Object();
            user.email = email;
            user.password = passwords;
            user.role =1;
            var insertQuery = "INSERT INTO user_table (fullname, email, password ) values ('" + fullname + "','" + email + "','" + passwords+ "')";
            db.query(insertQuery, function (err, rows) {
                user.user_id = rows.insertId;
                return done(null, user);
            });
        });
    },

));
exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.originalUrl = req.originalUrl;
    res.redirect('/login');
}
exports.isAdmin = function (req, res, next) {
    var user = req.session.passport.user.role;
    if (user == 0) {
        return next();
    }
    res.redirect('/login')
}
exports.isUser = function (req, res, next) {
    var user = req.session.passport.user.role;
    //console.log(user)
    if (user == 1) {
        return next();
    }
    res.redirect('/login');

}


