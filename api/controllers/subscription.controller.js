const db = require('../../config/db');
const Joi = require('@hapi/joi');



module.exports = {
    takeTrail: async (req, res, next) => {
        await db.query("SELECT * FROM product_table WHERE category_id = 1", (error, products, fields) => {
            return res.render('fontends/trail', {products: products, error: req.flash('error'), msg: req.flash('msg')})
        })
    },
    registerTrail: async (req, res, next) => {
        
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
    }
}

