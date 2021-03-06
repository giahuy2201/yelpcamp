// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground'),
    User = require('../models/user');

var middlewareObj = {
    beforeLogin: '/campgrounds', // to save the last place a guest access
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // not logined yet
    req.flash('error', 'You need to be logged in to do that');
    if (req.xhr) { // in case the addComment calls
        return res.send({
            isLoggedIn: false,
        })
    }
    return res.redirect('/login');
};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    Campground.findById(req.params.id).populate('author').exec((err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            return res.redirect('/campgrounds');
        }
        if (foundCampground.author._id.equals(req.user._id) || req.user.isAdmin) { // authorized
            // console.log(foundCampground);
            return next();
        } else { // no permision
            req.flash('error', 'You don\'t have permission to do that');
            return res.redirect('/campgrounds/' + req.params.id);
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
        if (foundComment.author._id.equals(req.user._id) || req.user.isAdmin) { // authorized
            // console.log(foundComment);
            return next();
        } else { // no permision
            req.flash('error', 'You don\'t have permission to do that');
            return res.redirect('/campgrounds/' + req.params.id);
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
            return next();
        } else { // no permision
            req.flash('error', 'You don\'t have permission to do that');
            return res.redirect('/users/' + req.params.id);
        }
    })
}

module.exports = middlewareObj;