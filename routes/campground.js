var express = require('express');

// include models
var Campground = require('../models/campground'),
    middleware = require('../middleware');

var router = express.Router();

// Campgrounds page
router.get('/', (req, res) => {
    Campground.find((err, campgrounds) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            // render index page
            res.render('campgrounds/index', {
                campgrounds: campgrounds
            });
        }
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
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            // update author
            campground.author = req.user;
            campground.save();
            // console.log(campground);
            res.redirect('/campgrounds');
        }
    })
})

// Campground show
router.get('/:id', (req, res) => {
    Campground.findById(req.params.id).populate([{
        path: 'comments',
        populate: {
            path: 'author',
            // model: 'User'
        }
    }, {
        path: 'author',
    }]).exec((err, foundCampground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            // console.log(foundCampground);
            res.render('campgrounds/show', {
                campground: foundCampground
            });
        }
    })
});

// Campground edit
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('campgrounds/edit', {
                campground: foundCampground
            });
        }
    })
});

// Campground update
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/campgrounds');
        }
    })
});

// Campground delete
router.delete('/:id', middleware.checkCampgroundOwnership, middleware.isLoggedIn, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/campgrounds');
        }
    })
});

module.exports = router;