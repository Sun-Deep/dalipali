const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/keys').secretOrKey;
const db = require('../../config/db');
module.exports = {
    // userCreater: (req, res) => {
    //     const { fullname, email, phone, address, password } = req.body;
    //     db.query('SELECT * FROM user_table WHERE (email=? or  phone=?)', [email, phone], (error, result) => {
    //         if (error) console.log(error)
    //         if (result.length > 0) {
    //             for (i = 0; i < result.length; i++) {
    //                 if (result[i].email == email) {
    //                     req.flash('email', 'email is already used')
    //                 }
    //                 if (result[i].phone == phone) {
    //                     req.flash('phone', 'phone is already used')
    //                 }
    //             }
    //             res.redirect('/registerpage')
    //         }
    //         else {
    //             hash = bcrypt.hashSync(req.body.password, 10);
    //             const passwords = hash;
    //             db.query('INSERT INTO user_table(fullname,email,phone,address,password) VALUES(?,?,?,?,?)', [fullname, email, phone, address, passwords], (error, result) => {
    //                 if (error) console.log(error);
    //                 req.flash('msg','Successfully Register')
    //                 res.redirect('/');
    //             })

    //         }
    //     })
    //     // 
    //     // db.query('INSERT INTO user_table(fullname,email,phone,address,password) VALUES(?,?,?,?,?)', [fullname, email, phone, address, password], (error, result) => {
    //     //     if (error) console.log(error);
    //     //     res.redirect('/');
    //     // });
    // },
    phoneCreater: (req, res) => {
        const { fullname, email, phone, address } = req.body;

        hash = bcrypt.hashSync(req.body.password, 10);
        const password = hash;

        db.query('INSERT INTO user_table(fullname,email,phone,address,password) VALUES(?,?,?,?,?)', [fullname, email, phone, address, password], (error, result) => {
            if (error) console.log(error);
            res.status(200).json({
                message: 'created user'
            });
        });
    },
    logCheck: (req, res, next) => {
        const { email } = req.body;
        db.query('SELECT * FROM user_table WHERE email =?', [email], (err, cb) => {
            if (err) return res.status(500).json({
                message: 'Internal Server Error'
            })
            if (cb.length === 0) {
                return res.status(401).json({
                    message: 'Auth failed.'
                })
            }
            bcrypt.compare(req.body.password, cb[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed.'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        id: cb[0].user_id,
                        username: cb[0].fullname,
                    }, jwtKey, {
                        expiresIn: '1hr'
                    });
                    res.status(200).send(
                        { auth: true, token }
                    );
                    // console.log(token);

                }
                // res.status(401).send("There's no user matching that");
            })
        });

    },
    //Checklogin:
}