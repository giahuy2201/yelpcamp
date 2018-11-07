// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground'),
    User = require('../models/user');

var middlewareObj = {
    beforeLogin: '/campgrounds',
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to be logged in to do that');
    if (req.xhr) {
        return res.send({
            isLoggedIn: false,
        })
    }
    middlewareObj.beforeLogin = req.originalUrl; // save the route to redirect after user asked to login
    res.redirect('/login');
};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    Campground.findById(req.params.id).populate('author').exec((err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            return res.redirect('/campgrounds');
        }
        if (foundCampground.author._id.equals(req.user._id)) { // authorized
            // console.log(foundCampground);
            next();
        } else { // no permision
            req.flash('error', 'You don\'t have permission to do that');
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    Comment.findById(req.params.commentId).populate('author').exec((err, foundComment) => {
        if (err || !foundComment) {
            req.flash('error', 'Comment not found!');
            console.log(err);
            return res.redirect('/campgrounds/' + req.params.id);
        }
        if (foundComment.author._id.equals(req.user._id)) { // authorized
            // console.log(foundComment);
            next();
        } else { // no permision
            req.flash('error', 'You don\'t have permission to do that');
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
}

middlewareObj.checkProfileOwnership = function (req, res, next) {
    User.findById(req.params.id, (err, foundUser) => {
        if (err || !foundUser) {
            req.flash('error', 'User not found!');
            console.log(err);
            return res.redirect('/campgrounds');
        }
        if (foundUser._id.equals(req.user._id)) { // authorized
            // console.log(foundUser);
            next();
        } else { // no permision
            req.flash('error', 'You don\'t have permission to do that');
            res.redirect('/users/' + req.params.id);
        }
    })
}

module.exports = middlewareObj;