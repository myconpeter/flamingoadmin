const express = require("express");
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const {ensureAuthenticated} = require('../config/auth');

router.delete("/deleteRequest/:id", ensureAuthenticated, (req, res)=>{
        Withdrawal.findByIdAndRemove(req.params.id, (err)=>{
        if (err){
            res.redirect("/withdraws");
        } else {
            req.flash('success_msg' , 'Successful deleted a withdrawal request');
            res.redirect("/withdraws");
        }
    });
});

module.exports = router; 
