// require libs
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    timeago = require('timeago.js');

// include models
var User = require('./models/user');

// include middleware
var middleware = require('./middleware');

// libs for env
require('dotenv').config();

// include routes
var campgroundRoute = require('./routes/campground'),
    commentRoute = require('./routes/comment'),
    userRoute = require('./routes/user'),
    rootRoute = require('./routes/index');

var app = express();
// connect to database
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true
});

// deal with the DeprecationWarning
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(session({ // MUST BE PLACED BEFORE BODYPARSER
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(express.static('public')); // for import stylesheets
app.use(flash());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Add method to Javascript primitive Date type
Date.prototype.toAgo = function () {
    return timeago().format(this);
};

// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// some global variables available in all routes
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.back = middleware.beforeLogin;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})

// add routes files
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/comments', commentRoute);
app.use('/users', userRoute);
app.use('/', rootRoute);

// start server
app.listen(process.env.PORT, process.env.HOST, () => {
    console.log('Server running at http://' + process.env.HOST + ':' + process.env.PORT);
});