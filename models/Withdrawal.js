const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const WithdrawalSchema  = new mongoose.Schema({
email :{
        type  : String,
        required : true
    } ,

acctname :{
      type  : String,
      required : true
  } ,
acctnum :{
    type  : String,
    required : true
} ,
bankname :{
    type  : String,
    required : true
} ,
telephone :{
    type  : Number,
    required : true
} ,

secret :{
    type  : String,
    required : true

} ,

amount: {
     type: Number, 
     default: 0
     },

date :{
    type : Date,
    default : new Date()
},

user: [ 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },  
]
});

const Withdrawal= mongoose.model('Withdrawal', WithdrawalSchema);

module.exports = Withdrawal;