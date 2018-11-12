var express = require('express'),
    nodeGeocoder = require('node-geocoder');

// include models
var Campground = require('../models/campground'),
    User = require('../models/user'),
    middleware = require('../middleware');

var router = express.Router();

// for geocoder
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
};
var geocoder = nodeGeocoder(options);

var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Campgrounds page
router.get('/', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to login
    Campground.find().populate('author').exec((err, campgrounds) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Campground index routing');
            return res.redirect('/campgrounds');
        }
        // console.log(campgrounds);
        // render index page
        res.render('campgrounds/index', {
            campgrounds: campgrounds
        });
    })
});

// Campgrounds new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) {
        return res.send({
            isLoggedIn: true
        });
    }
    res.render('campgrounds/new', {
        weekdays: weekdays
    });
});

// Campground create
router.post('/', middleware.isLoggedIn, (req, res) => {
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('/campgrounds/new');
        }
        // console.log(data[0]);
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        // get hours
        var hours = {};
        // console.log(req.body.dayCheck);
        for (var i in req.body.dayCheck) {
            var day = {
                open: req.body.dayOpenTime[i],
                close: req.body.dayCloseTime[i],
            }
            hours[i] = day;
        }
        // make campground variable
        var newCampground = {
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            website: req.body.website,
            telephone: req.body.telephone,
            price: req.body.price,
            lat: lat,
            lng: lng,
            location: location,
            hours: hours,
        };
        // start doing this
        User.findById(req.user._id, (err, foundUser) => {
            if (err || !foundUser) {
                req.flash('error', 'User not found!');
                console.log(err);
                console.log('*** Campground create routing');
                return res.redirect('/campgrounds');
            }
            Campground.create(newCampground, (err, newCampground) => {
                if (err || !newCampground) {
                    req.flash('error', 'Campground not found!');
                    console.log(err);
                    console.log('*** Campground create routing');
                    return res.redirect('/campgrounds');
                }
                // update author
                newCampground.author = req.user;
                newCampground.save();
                // update campground
                foundUser.campgrounds.push(newCampground);
                foundUser.save();
                // console.log(newCampground);
                // console.log(foundUser);
                req.flash('success', 'Your campground was added!');
                res.redirect('/campgrounds');
            })
        })
    })
})

// Campground show
router.get('/:id', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to login
    Campground.findById(req.params.id).populate([{
        path: 'comments',
        populate: {
            path: 'author',
            // model: 'User'
        }
    }, {
        path: 'author',
    }]).exec((err, foundCampground) => {
        if (err || !foundCampground) {
            console.log(err);
            console.log('*** Campground show routing');
            req.flash('error', 'Campground not found!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', {
            campground: foundCampground,
            weekdays: weekdays
        });
    })
});

// Campground edit
router.get('/:id/edit', middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Campground edit routing');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', {
            campground: foundCampground,
            weekdays: weekdays
        });
    })
});

// Campground update
router.put('/:id', middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    var updatedCampground = req.body.campground;
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('/campgrounds/' + req.params.id);
        }
        // console.log(data[0]);
        // update location
        updatedCampground.lat = data[0].latitude;
        updatedCampground.lng = data[0].longitude;
        updatedCampground.location = data[0].formattedAddress;
        // get hours
        var hours = {};
        for (var i in req.body.dayCheck) {
            var day = {
                open: req.body.dayOpenTime[i],
                close: req.body.dayCloseTime[i],
            }
            hours[i] = day;
        }
        updatedCampground.hours = hours;

        Campground.findByIdAndUpdate(req.params.id, updatedCampground, (err, updatedCampground) => {
            if (err || !updatedCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err);
                console.log('*** Campground update routing');
                return res.redirect('/campgrounds');
            }
            res.redirect('/campgrounds/' + req.params.id);

        })
    });
});

// Campground delete
router.delete('/:id', middleware.isLoggedIn, middleware.checkCampgroundOwnership, middleware.isLoggedIn, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            req.flash('error', 'Something went wrong!');
            console.log(err);
            console.log('*** Campground delete routing');
            return res.redirect('/campgrounds');
        }
        req.flash('success', 'Campground deleted!');
        res.redirect('/campgrounds');
    })
});
module.exports = router;