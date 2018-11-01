// const
const PORT = process.env.PORT || 3000,
    HOST = process.env.HOST || 'localhost',
    DATABASE = process.env.DATABASE || 'mongodb://localhost/yelpcamp1';

// require libs
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    mongoose = require('mongoose'),
    flash = require('connect-flash');

// include models
var User = require('./models/user');

// include routes
var campgroundRoute = require('./routes/campground'),
    userRoute = require('./routes/user'),
    commentRoute = require('./routes/comment');

var app = express();
// connect to database
mongoose.connect(DATABASE, {
    useNewUrlParser: true
});

// deal with the DeprecationWarning
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(session({ // MUST BE PLACED BEFORE BODYPARSER
    secret: 'buithuyan',
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); // for import stylesheets
app.use(flash());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// some global variables available in all routes
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})

// add routes files
app.use('/campgrounds', campgroundRoute);
app.use('/users', userRoute);
app.use('/campgrounds/:id/comments', commentRoute);

// Home page
app.get('/', (req, res) => {
    res.render('landing');
});

// Other page
app.get('/', (req, res) => {
    res.send('Page not found');
});

// start server
app.listen(PORT, HOST, () => {
    console.log('Server running at http://' + HOST + ':' + PORT);
});