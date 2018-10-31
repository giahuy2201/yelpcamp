var express = require('express');

// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground');

var router = express.Router({
    mergeParams: true
});

router.get('/new', (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('comments/new', {
                campground: foundCampground
            });
        }
    })
});

router.post('/', (req, res) => {
    // find the campground to associate
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            // create a comment object
            Comment.create(req.body.comment, (err, newComment) => {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                } else {
                    // update the comment's author
                    newComment.author = req.user;
                    newComment.save();
                    // update the campground's comments
                    foundCampground.comments.push(newComment);
                    foundCampground.save();
                    // go back
                    res.redirect('/campgrounds/' + req.params.id);
                }
            })
        }
    })
})

module.exports = router;