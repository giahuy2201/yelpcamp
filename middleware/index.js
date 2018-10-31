// include models
var Comment = require('../models/comment'),
    Campground = require('../models/campground');

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) { // user has logged in
        Campground.findById(req.params.id).populate('author').exec((err, foundCampground) => {
            if (foundCampground.author._id.equals(req.user._id)) { // authorized
                // console.log(foundCampground);
                next();
            } else { // no permision
                res.redirect('/campgrounds/' + req.params.id);
            }
        })
    } else {
        res.redirect('/users/login');
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) { // user has logged in
        Comment.findById(req.params.commentId).populate('author').exec((err, foundComment) => {
            if (foundComment.author._id.equals(req.user._id)) { // authorized
                // console.log(foundComment);
                next();
            } else { // no permision
                res.redirect('/campgrounds/' + req.params.id);
            }
        })
    } else {
        res.redirect('/users/login');
    }
}

module.exports = middlewareObj;