// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground'),
    User = require('../models/user');

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    middlewareObj.beforeLogin = req.originalUrl; // save the route to redirect after user login
    // console.log(req.originalUrl);
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/users/login');
};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    Campground.findById(req.params.id).populate('author').exec((err, foundCampground) => {
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