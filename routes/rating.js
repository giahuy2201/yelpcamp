var express = require('express');

var middleware = require('../middleware'),
    Campground = require('../models/campground');

var router = express.Router({
    mergeParams: true
});

// Rating get
router.get('/ratings', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err.message);
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
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
})

// Rating create
router.post('/ratings', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err.message);
                console.log('*** Rating create routing');
                return res.redirect('/campgrounds');
            }
            var rate = Number(req.query.rating);

            if (foundCampground.author.equals(req.user._id)) { // not allow authors to rate their campground
                console.log('***');
                return;
            }

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
            foundCampground.save();
            return res.send({
                average: foundCampground.ratings['average'],
                number: foundCampground.ratings['number'],
            });
        });
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
});

router.post('/likes', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err.message);
                console.log('*** Rating create routing');
                return res.redirect('/campgrounds');
            }
            var liked = true;
            var likes = foundCampground.likes;
            // console.log(likes);
            var present = likes.indexOf(req.user._id);
            // console.log(present);
            if (present != -1) {
                likes.splice(present, 1);
                liked = false;
            } else {
                likes.push(req.user._id);
            }
            foundCampground.likes = likes;
            foundCampground.save();
            return res.send({
                number: likes.length,
                liked: liked,
                isLoggedIn: true,
            });
        });
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
});

module.exports = router;