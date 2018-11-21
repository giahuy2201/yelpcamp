var express = require('express');

var middleware = require('../middleware'),
    Campground = require('../models/campground'),
    User = require('../models/user');

var router = express.Router({
    mergeParams: true
});

// Rating get
router.get('/ratings', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) { // for ajax
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
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
})

// Rating create
router.post('/ratings', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) { // for ajax
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err);
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
            foundCampground.ratingsLength = Object.keys(updatedRatings).length;
            // console.log('length ' + updatedRatings['number']);
            foundCampground.ratingsAverage = Math.round((sum / foundCampground.ratingsLength) * 10) / 10;
            // console.log('average ' + updatedRatings['average']);
            foundCampground.ratings = updatedRatings;
            foundCampground.save();
            return res.send({
                average: foundCampground.ratingsAverage,
                number: foundCampground.ratingsLength,
            });
        });
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
});

router.post('/likes', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) { // for ajax too
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err);
                console.log('*** Rating create routing');
                return res.redirect('/campgrounds');
            }
            User.findById(foundCampground.author._id).populate('campgrounds').exec((err, foundUser) => {
                var liked = true; // consider this user likes the campground be default
                var likes = foundCampground.likes;
                // console.log(likes);
                var present = likes.indexOf(req.user._id);
                // console.log(present);
                if (present != -1) { // if he unlikes
                    likes.splice(present, 1);
                    liked = false;
                } else {
                    likes.push(req.user._id);
                }
                foundCampground.likes = likes;
                foundCampground.likesLength = foundCampground.likes.length;
                foundCampground.save();
                if (liked) {
                    foundUser.likesLength++;
                } else {
                    foundUser.likesLength--;
                }
                foundUser.save();
                return res.send({
                    number: likes.length,
                    liked: liked,
                    isLoggedIn: true,
                });
            });
        });
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
});

function count(array, field) { // calculate the sum of field in all object element in array
    var sum = 0;
    for (const obj of array) {
        if (obj[field]) {
            sum += obj[field];
        }
    }
    return sum;
}

module.exports = router;