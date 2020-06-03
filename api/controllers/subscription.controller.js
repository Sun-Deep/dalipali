const db = require('../../config/db');
const Joi = require('@hapi/joi');



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
    }
}

