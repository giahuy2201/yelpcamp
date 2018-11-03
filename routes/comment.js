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
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Comment new routing');
            return res.redirect('/campgrounds');
        }
        res.render('comments/new', {
            campground: foundCampground
        });
    })
});

// Comment create
router.post('/', middleware.isLoggedIn, (req, res) => {
    // find the campground to associate
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Comment create routing');
            return res.redirect('/campgrounds');
        }
        // create a comment object
        Comment.create(req.body.comment, (err, newComment) => {
            if (err || !newComment) {
                req.flash('error', 'Campground not found!');
                console.log(err);
                console.log('*** Comment create routing');
                return res.redirect('/campgrounds');
            }
            // update the comment's author
            newComment.author = req.user;
            newComment.save();
            // update the campground's comments
            foundCampground.comments.push(newComment);
            foundCampground.save();
            // go back
            res.redirect('/campgrounds/' + req.params.id);
        })

    })
});

// Comment edit
router.get('/:commentId/edit', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Comment edit routing');
            return res.redirect('/campgrounds');
        }
        Comment.findById(req.params.commentId, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash('error', 'Comment not found!');
                console.log(err);
                console.log('*** Comment edit routing');
                return res.redirect('/campgrounds/' + req.params.id);
            }
            res.render('comments/edit', {
                campgroundId: req.params.id,
                comment: foundComment
            });
        })
    })
})

// Comment update
router.put('/:commentId', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Comment update routing');
            return res.redirect('/campgrounds');
        }
        Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, updatedComment) => {
            if (err || !updatedComment) {
                req.flash('error', 'Comment not found!');
                console.log(err);
                console.log('*** Comment update routing');
                return res.redirect('/campgrounds');
            }
            res.redirect('/campgrounds/' + req.params.id);
        })
    })
})

// Comment delete
router.delete('/:commentId', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.commentId, (err) => {
        if (err) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Comment delete routing');
            return res.redirect('/campgrounds');
        }
        res.redirect('/campgrounds/' + req.params.id);
    })
})

module.exports = router;