const db = require('../../config/db');
const Joi = require('@hapi/joi');
const { object } = require('@hapi/joi');



module.exports = {

    takeTrial: (req, res, next) => {
        db.query("SELECT * FROM product_table WHERE category_id = 1", (error, products, fields) => {
            return res.render('fontends/trail', {products: products, error: req.flash('error'), msg: req.flash('msg')})
        })
    },

    registerTrial: (req, res, next) => {
        
        let {name, address, phone, product_id, startdate, delivermode, timeslot1, timeslot2, timeslot3 } = req.body

        const schema = Joi.object({
            name: Joi.string().required(),
            address: Joi.string().required(),
            phone: Joi.string().required(),
            product_id: Joi.number().required(),
            startdate: Joi.string().required(),
            delivermode: Joi.string().required()
        })

        const {error, value} = schema.validate({name, address, phone, product_id, startdate, delivermode}, {abortEarly: false})
        
        if(error){
            console.log(error.details[0].message)
            req.flash('error', error.details[0].message)
            res.redirect('/subscription/trial')
        }else{
            if(!timeslot2 && !timeslot3 && !timeslot1){
                req.flash('error', 'Time slot should be selected')
                res.redirect('/subscription/trial')

            }else{

                // formatting timeslot
                let timeslot = ''
                if (timeslot1) timeslot += timeslot1 + ','
                if (timeslot2) timeslot += timeslot2 + ','
                if (timeslot3) timeslot += timeslot3 + ','
                
                // formatting dates
                let enddate = new Date(startdate)
                enddate.setDate(enddate.getDate() + 5)
                
                startdate = new Date(startdate)
                
                
               db.query("INSERT INTO subs_trial (name, address, phone, product_id, startdate, enddate, timeslot, delivermode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
               [value.name, value.address, value.phone, value.product_id, startdate, enddate, timeslot, value.delivermode], (error, results, fields) => {
                   if (error){
                       console.log(error)
                       req.flash('error', 'Something went wrong. Please try again later')
                       res.redirect('/subscription/trial')
                   }else{
                       req.flash('msg', 'Trail subscription requested successfully')
                       res.redirect('/subscription/trial')
                   }
               })
            }
            
        }
    },

    viewTrialRequest: (req, res, next) => {
        db.query("SELECT subs_trial.name, subs_trial.address, subs_trial.phone, product_table.product_name, subs_trial.startdate, subs_trial.status, subs_trial.id FROM subs_trial, product_table WHERE subs_trial.status = 0 AND subs_trial.deleted = 0 AND product_table.product_id = subs_trial.product_id",
        (error, results, fields) => {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            if (results.length > 0){
                results.forEach(element => {
                    element.startdate = element.startdate.toLocaleDateString('en-US', options)
                });
            }
            
            res.render(
                    'backends/subscription/trialRequest', 
                    {
                        layout: 'layout',
                        trials: results
                    }
                )
        })
    },

    acceptTrial: (req, res, next) => {
        let id = req.params.id
        db.query("UPDATE subs_trial SET status = 1 WHERE id = ?",
        [id], (error, results, fields) => {
            if (error) console.log(error)
            res.redirect('/subscription/trailRequest')
        })
    },

    deleteTrial: (req, res, next) => {
        let id = req.params.id
        db.query("UPDATE subs_trial SET status = 0, deleted = 1 WHERE id = ?",
        [id], (error, results, fields) => {
            if (error) console.log(error)
            res.redirect('/subscription/trailRequest')
        })
    },

    viewTrial: (req, res, next) => {
        db.query("SELECT subs_trial.name, subs_trial.address, subs_trial.phone, product_table.product_name, subs_trial.startdate, subs_trial.status, subs_trial.id FROM subs_trial, product_table WHERE subs_trial.status = 1 AND subs_trial.deleted = 0 AND product_table.product_id = subs_trial.product_id",
        (error, results, fields) => {

            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            
            results.forEach(element => {
                element.startdate = element.startdate.toLocaleDateString('en-US', options)
            });
            res.render(
                    'backends/subscription/trials', 
                    {
                        layout: 'layout',
                        trials: results
                    }
                )
        })
    },

    trialDetails: (req, res, next) => {
        let id = req.params.id
        db.query("SELECT subs_trial.*, product_table.product_name FROM subs_trial, product_table WHERE subs_trial.id = ? AND subs_trial.product_id = product_table.product_id",
        [id], (error, results, fields) => {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

            results.forEach((element) => {
                element.startdate = element.startdate.toLocaleDateString('en-US', options)
                element.enddate = element.enddate.toLocaleDateString('en-US', options)
                element.timeslot = element.timeslot.split(',').slice(0, -1)
            })
            db.query("SELECT * FROM subs_trial_record WHERE subs_trial_id = ?",
            [id], (error, records, fields) => {
                if(records.length > 0){
                    records.forEach((element) => {
                        element.deliver_date = element.deliver_date.toLocaleDateString('en-US', options)
                    })
                }
                
                res.render(
                    'backends/subscription/trialDetails',
                    {
                        layout: 'layout',
                        details: results[0],
                        records: records
                    }
                )
            })
            
        })
        
    },

    deliverTrial: (req, res, next) => {
        let id = req.body.trialid
        let deliver_date = req.body.deliverdate
        db.query("INSERT INTO subs_trial_record (subs_trial_id, deliver_date, status) VALUES (?, ?, 1)",
        [id, deliver_date], (error, results, fields) => {
            if(error){
                console.log(error)
            }
            res.redirect('/subscription/trial/'+id)
        })
    },

    changeDeliverStatus: (req, res, next) => {
        let id = req.params.id
        let status = req.params.status
        console.log(id, status)
        db.query("UPDATE subs_trial_record SET status = ? WHERE id = ?",
        [status, id], (error, results, fields) => {
            if (error){
                console.log(error)
            }else{
                res.json({'success': 'Updated Sccessfully'})
            }
        })
    },

    loadSubscribeRequest: (req, res, next) => {
        db.query("SELECT * FROM product_table WHERE category_id = 1", (error, products, fields) => {
            res.render(
                'fontends/subscribeRequest',
                {
                    products: products, 
                    error: req.flash('error'), 
                    msg: req.flash('msg')
                }
            )
        })
        
    },

    subscribeRequest: (req, res, next) => {
        let {product, startdate, enddate, timeslot1, qtytime1, timeslot2, qtytime2, timeslot3, qtytime3, delivermode} = req.body
        const schema = Joi.object({
            product: Joi.number().required(),
            startdate: Joi.string().required(),
            enddate: Joi.string().required(),
            delivermode: Joi.string().required()
        })

        const {error, value} = schema.validate({product, startdate, enddate, delivermode}, {abortEarly: false})
        if (error){
            console.log(error.details[0].message)
            req.flash('error', error.details[0].message)
            res.redirect('/subscription/subscribeRequest')
        }else{
            if (!timeslot1 && !timeslot2 && !timeslot3){
                req.flash('error', 'Time slot should be selected')
                res.redirect('/subscription/subscribeRequest')
            }else{
                if(!timeslot1){
                    qtytime1 = null
                }else{
                    if(!qtytime1){
                        req.flash('error', 'Quantity should not be empty.')
                        res.redirect('/subscription/subscribeRequest')
                    }
                }
                if(!timeslot2){
                    qtytime2 = null
                }else{
                    if(!qtytime2){
                        req.flash('error', 'Quantity should not be empty.')
                        res.redirect('/subscription/subscribeRequest')
                    }
                }
                if(!timeslot3){
                    qtytime3 = null
                }else{
                    if(!qtytime3){
                        req.flash('error', 'Quantity should not be empty.')
                        res.redirect('/subscription/subscribeRequest')
                    }
                }

                db.query("INSERT INTO subs_permanent (user_id, product_id, startdate, enddate, timeslot1, timeslot2, timeslot3, qtytimeslot1, qtytimeslot2, qtytimeslot3, delivermode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [req.session.passport.user.id, value.product, value.startdate, value.enddate, timeslot1, timeslot2, timeslot3, qtytime1, qtytime2, qtytime3, value.delivermode], 
                (error, results, fields) => {
                    if (error) {
                        console.log(error)
                        req.flash('error', 'Something went wrong. Please try again later.')
                        res.redirect('/subscription/subscribeRequest')
                    }else{
                        req.flash('msg', 'Subscription requested successfully. You will be contacted soon.')
                        res.redirect('/subscription/subscribeRequest')
                    }

                })
               
               
            }
        }
    },

    viewSubscribeRequest: (req, res, next) => {
        db.query("SELECT subs_permanent.*, user_table.fullname, user_table.address, user_table.phone, product_table.product_name FROM subs_permanent, user_table, product_table WHERE subs_permanent.user_id = user_table.user_id AND product_table.product_id = subs_permanent.product_id AND subs_permanent.status = 0 AND subs_permanent.deleted = 0",
        (error, results, fields) => {
            
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            if (results.length > 0){
                results.forEach(element => {
                    element.startdate = element.startdate.toLocaleDateString('en-US', options)
                    element.enddate = element.enddate.toLocaleDateString('en-US', options)
                });
            }
            res.render(
                'backends/subscription/subscribeRequest',
                {   
                    layout: 'layout',
                    results: results
                }
            )
        })
        
    },

    acceptRequest: (req, res, next) => {
        let id = req.params.id
        db.query("UPDATE subs_permanent SET status = 1 WHERE id = ?",
        [id], (error, results, fields) => {
            if (error) console.log(error)
            res.redirect('/subscription/request')
        })
    },

    deleteRequest: (req, res, next) => {
        let id = req.params.id
        db.query("UPDATE subs_permanent SET status = 0, deleted = 1 WHERE id = ?",
        [id], (error, results, fields) => {
            if (error) console.log(error)
            res.redirect('/subscription/request')
        })
    },

    viewSubscriptions: (req, res, next) => {
        db.query("SELECT subs_permanent.*, product_table.product_name, user_table.fullname, user_table.address, user_table.phone FROM subs_permanent, product_table, user_table WHERE subs_permanent.user_id = user_table.user_id AND subs_permanent.status = 1 AND subs_permanent.deleted = 0 AND product_table.product_id = subs_permanent.product_id",
        (error, results, fields) => {

            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            
            results.forEach(element => {
                element.startdate = element.startdate.toLocaleDateString('en-US', options)
            });
            res.render(
                    'backends/subscription/subscriptions', 
                    {
                        layout: 'layout',
                        subscriptions: results
                    }
                )
        })
    },

    subscriptionDetails: (req, res, next) => {
        let id = req.params.id
    
        db.query("SELECT subs_permanent.*, product_table.product_name, user_table.fullname, user_table.address, user_table.phone FROM subs_permanent, product_table, user_table WHERE subs_permanent.user_id = user_table.user_id AND subs_permanent.id = ? AND subs_permanent.status = 1 AND subs_permanent.deleted = 0 AND product_table.product_id = subs_permanent.product_id", 
        [id], (error, results, fields) => {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

            results.forEach((element) => {
                element.startdate = element.startdate.toLocaleDateString('en-US', options)
                element.enddate = element.enddate.toLocaleDateString('en-US', options)
            })

            db.query("SELECT * FROM subs_permanent_record WHERE subs_permanent_id = ?",
            [id], (error, records, fields) => {
                if(records.length > 0){
                    records.forEach((element) => {
                        element.deliver_date = element.deliver_date.toLocaleDateString('en-US', options)
                    })
                }
                
                res.render(
                    'backends/subscription/subscriptionDetails',
                    {
                        layout: 'layout',
                        details: results[0],
                        records: records
                    }
                )
            })
        })
    },

    deliver: (req, res, next) => {
        let id = req.body.deliverid
        let deliver_date = req.body.deliverdate

        db.query("INSERT INTO subs_permanent_record (subs_permanent_id, deliver_date) VALUES (?, ?)",
        [id, deliver_date], (error, results, fields) => {
            if(error){
                console.log(error)
            }
            res.redirect('/subscription/details/'+id)
        })
    },

    editDeliverStatus: (req, res, next) => {
        let { quantity, time, part, id, status, subs_id } = req.body
        db.query("UPDATE subs_permanent_record SET timeslot"+ part +" = ?, qtytimeslot"+ part +" = ?, status"+ part +" = ? WHERE id = ?",
        [time, quantity, status, id], (error, results, fields) => {
            if (error){
                console.log(error)
                res.json('Updated gone wrong')
            }else{
                res.json('Success')
            }
        })
    },

    mySubscription: (req, res, next) => {
        let id = req.session.passport.user.id
        db.query("SELECT subs_permanent.*, product_table.product_name, user_table.fullname, user_table.address, user_table.phone FROM subs_permanent, product_table, user_table WHERE subs_permanent.user_id = user_table.user_id AND subs_permanent.user_id = ? AND subs_permanent.status = 1 AND subs_permanent.deleted = 0 AND product_table.product_id = subs_permanent.product_id",
        [id], (error, results, fields) => {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

            results.forEach((element) => {
                element.startdate = element.startdate.toLocaleDateString('en-US', options)
                element.enddate = element.enddate.toLocaleDateString('en-US', options)
            })

            db.query("SELECT * FROM subs_permanent_record WHERE subs_permanent_id = ?",
            [results[0].id], (error, records, fields) => {
                if(records.length > 0){
                    records.forEach((element) => {
                        element.deliver_date = element.deliver_date.toLocaleDateString('en-US', options)
                    })
                }
                
                res.render(
                    'fontends/mySubscription',
                    {
                        details: results[0],
                        records: records,
                        error: req.flash('error'), 
                        msg: req.flash('msg')
                    }
                )
            })
        })
    },

    reqChangeQty: (req, res, next) => {
        console.log(req.body)
        Object.keys(req.body).forEach((element) => {
            if(!req.body[element]){
                delete req.body[element]
            }else{
                req.body[element] = String(req.body[element])
            }
        })
        let k = Object.keys(req.body)
        let v = Object.values(req.body)
        let q = "INSERT INTO subs_permanent_record ("+ k +") VALUES ("+ v.map(a => {return `'${a}'`}) +")"
        console.log(q)
        db.query(q, [], (error, results, fields) => {
            if (error){
                console.log(error)
                req.flash('error', 'Something went wrong')
                res.redirect('/subscription/mySubscription')
            }else{
                req.flash('msg', 'Requested Successfully')
                res.redirect('/subscription/mySubscription')
            }
        })
        console.log(req.body)
    }
}

