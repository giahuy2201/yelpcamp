var express = require('express');

// include models
var Campground = require('../models/campground'),
    User = require('../models/user'),
    middleware = require('../middleware');

var router = express.Router();

// Campgrounds page
router.get('/', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to login
    Campground.find((err, campgrounds) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Campground index routing');
            return res.redirect('/campgrounds');
        }
        // render index page
        res.render('campgrounds/index', {
            campgrounds: campgrounds
        });
    })
});

// Campgrounds new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// Campground create
router.post('/', middleware.isLoggedIn, (req, res) => {
    // make campground variable
    var newCampground = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        price: req.body.price,
    };
    User.findById(req.user._id, (err, foundUser) => {
        if (err || !foundUser) {
            req.flash('error', 'User not found!');
            console.log(err);
            console.log('*** Campground create routing');
            return res.redirect('/campgrounds');
        }
        Campground.create(newCampground, (err, newCampground) => {
            if (err || !foundCampground) {
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
            campground: foundCampground
        });
    })
});

// Campground update
router.put('/:id', middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
        if (err || !campground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Campground update routing');
            return res.redirect('/campgrounds');
        }
        res.redirect('/campgrounds');
    })
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