const express = require('express');
const app     = express();
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
const passport = require ('passport');
const methodOverride = require("method-override");
const session = require('express-session');
const flash = require("connect-flash");
const PORT  = process.env.PORT || 4000;

//passport config:
require('./config/passport');

// mongoose connection
// mongoose.connect('mongodb+srv://flamingo:michealisaman@cluster0.hknyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true
// });

mongoose.connect('mongodb://localhost/flamingo', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
  useFindAndModify: false,
   useCreateIndex: true
 })
 .then(() => console.log('connected to db from express'))
.catch((err)=> console.log(err)); 

const indexRoutes = require("./routes/index");
const transferRoutes = require("./routes/transfer");
const adminRoutes = require("./routes/admin");
const withdrawRoutes = require("./routes/withdraw");
const deleteRoutes = require("./routes/delete");
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

app.use(methodOverride("_method"));

// routes
app.use(indexRoutes);
app.use(transferRoutes);
app.use(adminRoutes);
app.use(withdrawRoutes);
app.use(deleteRoutes);

app.listen(PORT, ()=> {
    console.log("express is now running on port 4000");
});
