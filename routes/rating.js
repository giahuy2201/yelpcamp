var express = require('express');

var middleware = require('../middleware'),
    Campground = require('../models/campground');

var router = express.Router({
    mergeParams: true
});

// Rating get
router.get('/', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Rating create routing');
            return res.redirect('/campgrounds');
        }
        var rate = 0;
        if (foundCampground.ratings) {
            rate = foundCampground.ratings[req.user._id.toString()];
        }
        return res.send({
            rate: rate
        });
    });
})

// Rating create
router.post('/', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Rating create routing');
            return res.redirect('/campgrounds');
        }
        var rate = Number(req.query.rating);

        var key = req.user._id.toString(); // key as a variable
        var updatedRatings = {};
        for (var id in foundCampground.ratings) {
            if (id != 'average' && id != 'number' && (typeof foundCampground.ratings[id]) == 'number') {
                updatedRatings[id] = foundCampground.ratings[id];
            }
        }
        updatedRatings[key] = rate;
        // calculate the average;
        var sum = 0;
        for (var id in updatedRatings) {
            sum += updatedRatings[id];
        }

        // console.log('sum ' + sum);
        updatedRatings['number'] = Object.keys(updatedRatings).length;
        // console.log('length ' + updatedRatings['number']);
        updatedRatings['average'] = Math.round((sum / updatedRatings['number']) * 10) / 10;
        // console.log('average ' + updatedRatings['average']);
        foundCampground.ratings = updatedRatings;
        // console.log(updatedRatings);
        foundCampground.save();
        return res.send({
            average: foundCampground.ratings['average'],
            number: foundCampground.ratings['number'],
        });
    });
})

module.exports = router;