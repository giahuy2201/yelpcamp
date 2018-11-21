var express = require('express'),
    ejs = require('ejs');

// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground'),
    middleware = require('../middleware');

var router = express.Router({
    mergeParams: true
});

// Comment new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    if (req.xhr) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err);
                console.log('*** Comment update routing');
                return res.redirect('/campgrounds');
            }
            ejs.renderFile(__dirname + '/../views/comments/new.ejs', { // use ejs to get the ejs rendered String for ajax
                campgroundId: req.params.id
            }, (err, newForm) => {
                if (err) {
                    req.flash('error', 'Something went wrong!');
                    console.log(err);
                    console.log('*** Comment new routing');
                    return res.redirect('/campgrounds/' + req.params.id);
                }
                return res.send({
                    isLoggedIn: true,
                    form: newForm,
                });
            });

        });
    } else { // The Campground.find is synchronous, so else is needed to avoid ERR_HTTP_HEADER_SENT
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
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
        // create a comment 
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
            foundCampground.commentsLength = foundCampground.comments.length; // update the length of comments array
            foundCampground.save();
            // go back
            return res.redirect('/campgrounds/' + req.params.id);
        })

    })
});

// Comment edit
router.get('/:commentId/edit', middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
    // send an object with status isLoggedIn and the form object
    if (req.xhr) {
        Comment.findById(req.params.commentId, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash('error', 'Comment not found!');
                console.log(err);
                console.log('*** Comment edit routing');
                return res.redirect('/campgrounds/' + req.params.id);
            }
            ejs.renderFile(__dirname + '/../views/comments/edit.ejs', {
                campgroundId: req.params.id,
                comment: foundComment,
            }, (err, editForm) => {
                if (err) {
                    req.flash('error', 'Something went wrong!');
                    console.log(err);
                    console.log('*** Comment edit routing');
                    return res.redirect('/campgrounds/' + req.params.id);
                }
                return res.send({
                    isLoggedIn: true,
                    form: editForm,
                });
            });
        });
    } else {
        req.flash('error', 'Huh! It\'s not a good action');
        return res.redirect('/campgrounds/' + req.params.id);
    }
});

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
            req.flash('error', 'Comment not found!');
            console.log(err);
            console.log('*** Comment delete routing');
            return res.redirect('/campgrounds');
        }
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                req.flash('error', 'Campground not found!');
                console.log(err);
                console.log('*** Comment delete in Camgpround routing');
                return res.redirect('/campgrounds');
            }
            // delete the reference in the carrying campground
            var deletedCommentIndex = foundCampground.comments.indexOf(req.params.commentId);
            // console.log(deletedCommentIndex);
            foundCampground.comments.splice(deletedCommentIndex, 1);
            foundCampground.save();
            // console.log(foundCampground);
            res.redirect('/campgrounds/' + req.params.id);
        })
    })
})

module.exports = router;