// require libs
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    timeago = require('timeago.js'),
    cloudinary = require('cloudinary'),
    favicon = require('serve-favicon');

// include models
var User = require('./models/user');

// include middleware
var middleware = require('./middleware');

// libs for env
require('dotenv').config();

// Cloud image setting
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// include routes
var campgroundRoute = require('./routes/campground'),
    commentRoute = require('./routes/comment'),
    userRoute = require('./routes/user'),
    ratingRoute = require('./routes/rating'),
    rootRoute = require('./routes');

var app = express();
// connect to database
mongoose.connect(process.env.DATABASE_URL, {
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
// to get a formated Hours String for display business hours
String.prototype.toTime = function () {
    var h = Math.trunc(this);
    var m = (this - h) * 60;
    var hours = h + ':' + m;
    if (m == 0) {
        hours += '0';
    }
    return hours;
};
// convert hour & minute to number
Date.prototype.toNumber = function () {
    var hour = this.getHours();
    var minute = this.getMinutes();
    return num = hour + minute / 60;
}
// check if this is in period
Date.prototype.inPeriod = function (open, close) {
    var now = new Date();
    if (open <= now.toNumber() && close >= now.toNumber()) {
        return true;
    }
    return false;
};

// add favicon
app.use(favicon('public/favicon.ico'));

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
app.use('/campgrounds/:id', ratingRoute);
app.use('/users', userRoute);
app.use('/', rootRoute);

// start server
app.listen(process.env.PORT, () => {
    console.log('Server running');
});