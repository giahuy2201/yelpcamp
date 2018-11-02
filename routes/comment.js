var express = require('express');

// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground'),
    middleware = require('../middleware');

var router = express.Router({
    mergeParams: true
});

// Comment new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Comment new routing');
            res.redirect('back');
        } else {
            res.render('comments/new', {
                campground: foundCampground
            });
        }
    })
});

// Comment create
router.post('/', middleware.isLoggedIn, (req, res) => {
    // find the campground to associate
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Comment create routing');
            res.redirect('back');
        } else {
            // create a comment object
            Comment.create(req.body.comment, (err, newComment) => {
                if (err) {
                    req.flash('error', 'Something went wrong! Try again later');
                    console.log(err);
                    console.log('*** Comment create routing');
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
});

// Comment edit
router.get('/:commentId/edit', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.commentId, (err, foundComment) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Comment edit routing');
            res.redirect('back');
        } else {
            res.render('comments/edit', {
                campgroundId: req.params.id,
                comment: foundComment
            });
        }
    })
})

// Comment update
router.put('/:commentId', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, updatedComment) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Comment update routing');
            res.redirect('back');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
})

// Comment delete
router.delete('/:commentId', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.commentId, (err) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Comment delete routing');
            res.redirect('back');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
})

module.exports = router;