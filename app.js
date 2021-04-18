const express = require('express');
const app     = express();
const bodyParser = require('body-parser');
const expressEjsLayout = require('express-ejs-layouts');

const mongoose= require('mongoose');
const passport = require ('passport');

const bcrypt = require('bcrypt');

const session = require('express-session');

const LocalStrategy = require("passport-local");
const User = require("./models/user");
const Admin = require('./models/Admin');



const {ensureAuthenticated} = require('./config/auth') 



const methodOverride = require("method-override");
const flash = require("connect-flash");


const PORT  = process.env.PORT || 4000;


//passport config:
require('./config/passport')
// require('./config/passportx')(passportx)


// mongoose connection

mongoose.connect('mongodb+srv://flamingo:michealpeter@cluster0.pa829.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true
});

// mongoose.connect('mongo "mongodb+srv://cluster0.pa829.mongodb.net/myFirstDatabase" --username flamingo', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//  useFindAndModify: false,
//    useCreateIndex: true
//   });
//  .then(() => console.log('connected to db from express'))
// .catch((err)=> console.log(err)); 


// mongoose.connect('mongodb://localhost/flamingo', {
//    useNewUrlParser: true,
//    useUnifiedTopology: true,
//   useFindAndModify: false,
//    useCreateIndex: true
//  })
//  .then(() => console.log('connected to db from express'))
// .catch((err)=> console.log(err)); 


//EJS
app.set('view engine','ejs');
//app.use(expressEjsLayout);



 // POASSPORT CONFIGURATION
 app.use(session({
    secret : 'micheal',
    resave : true,
    saveUninitialized : true
}));


app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
    })


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    currentAdmin = req.user;
    next();
});

// routes
app.get('/', ensureAuthenticated, (req, res)=>{
    console.log(req.user.transferAmount);

    res.render('adminpage')
})

app.get('/adminlogin', (req, res)=>{
    res.render('adminlogin')
})

app.post('/adminlogin', (req, res, next)=>{
    passport.authenticate('userAdmin',{
        successRedirect : '/',
        failureRedirect: '/adminlogin',
        failureFlash : true
    })(req,res,next)
    });




app.get('/admincreate',  (req, res)=>{
        res.render('admincreate')
    });

app.post('/admincreate',(req,res)=>{
        const {email, password,transferAmount} = req.body;
        let errors = [];
        console.log( 'email :' + email+ ' pass:' + password +  'tranAmt:' + transferAmount );
        if(!email || !password || !transferAmount) {
            errors.push({msg : "Please fill in all fields"})
        }
        //check if match
        
        
        //check if password is more than 6 characters
        if(password.length < 6 ) {
            errors.push({msg : 'password atleast 6 characters'})
        }
        if(errors.length > 0 ) {
        res.redirect('/admincreate', {
            errors : errors,
            email : email,
    
            password : password,
            transferAmount : transferAmount
    
    
        })
         } else {
            //validation passed
           Admin.findOne({email : email}).exec((err, admin)=>{
            console.log(admin);   
            if(admin) {
                errors.push({msg: 'Admin - email already registered'});
                res.redirect('/admincreate',{email,password,transferAmount})  
               } else {
                const newAdmin = new Admin({
    
                    email : email,
                    password : password,
                    transferAmount : transferAmount
    
    
                });
        
                //hash password
                bcrypt.genSalt(10,(err,salt)=> 
                bcrypt.hash(newAdmin.password,salt,
                    (err,hash)=> {
                        if(err) throw err;
                            //save pass to hash
                            newAdmin.password = hash;
                        //save user
                        newAdmin.save()
                        .then((value)=>{
                            console.log(value)
                            req.flash('success_msg','You have now registered as an admin!');
                            res.render('adminlogin');
                        })
                        .catch(value=> console.log(value));
    
                          
                    }));
                 }
           })
        }
        });



app.post('/transfer', (req, res)=>{
    const idd = req.user.id
    console.log(idd);
    const realamt= req.user.transferAmount;
            const {userEmail, amount} =req.body;
            let errors = [];
            // console.log('email: '+ userEmail + '  amount: ' + amount);
            if (!userEmail || !amount){
                errors.push({msg : 'please fill this form to transfer'});
            }

            if (isNaN(amount)) {
                errors.push({msg : 'please fill a number in these format:10000 for ten thousand'});
  
            }
       
            if(errors.length > 0 ) {
                res.render('adminpage', {
                    errors : errors,
                    userEmail : userEmail,
                    amount : amount,
            
            
                })
                
            } 

            
            
            else {
                User.findOne({email : userEmail}).exec((err, correctuser)=>{

                    // console.log(idd);   
                    if(!correctuser) {
                        errors.push({msg: 'this username does not match with db'});
                        res.render('adminpage', {
                            errors : errors,
                            userEmail : userEmail,
                            amount : amount,   
                        })  
                       } else {
                        Admin.findByIdAndUpdate(idd, {transferAmount: (realamt - amount)}, function(err, data) {
                           
                            // console.log(data)

                            if (err) {
                                console.log('not transfer')
                            }else {
                                const idd = correctuser.id
                                // console.log(idd)
                                
                                User.findByIdAndUpdate(idd, {recievedAmount: amount}, (err, user)=>{
                                 console.log(user)
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        // User.updateOne({recievedAmount: amount}, function(err, update){
                                        //     if (err){
                                        //         console.log(err)
                                        //     } else{
                                     req.flash('success_msg' , 'Successfully transfered ' + amount + ' to ' + userEmail);
                                      res.redirect('/');

                                        //     }
                                        // })
                                       
                                        // User.save();

                                    //    User.updateOne({recievedAmount : 0}, (err, ok)=>{
                                    //      if(err){
                                    //          console.log(err)
                                    //      }   else{}
                                    // })
                                    }
                                })
                            }
                        });

                        // req.flash('success_msg' , 'Successfully transfered ' + amount + ' to ' + userEmail);
                        



                      

                       

                
                         }
                   })


                // res.send('processing')
                // if the email is not i database return error
                // find the admin and updata it total amount - amount
                // find the user and add the total amount
                //if succeful send transfer succeful
                //
            }
        })
        



app.get('/adminlogout',(req,res)=>{
        req.logout();
        req.flash('success_msg','Now logged out');
        res.redirect('/'); 
        });



app.listen(PORT, ()=> {
    console.log("express is now running on port 4000");
});
