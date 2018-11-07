var express = require('express'),
    passport = require('passport');

// include model
var User = require('../models/user'),
    middleware = require('../middleware');

var router = express.Router();

// User show
router.get('/:id', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to login
    User.findById(req.params.id).populate('campgrounds').exec((err, foundUser) => {
        if (err || !foundUser) {
            req.flash('error', 'User not found!');
            console.log(err);
            console.log('*** User show routing');
            return res.redirect('/campgrounds');
        }
        // Calculate total likes
        var likes = 0;
        foundUser.campgrounds.forEach((campground) => {
            likes += campground.likes.length;
        })
        // console.log(likes);
        res.render('users/show', {
            user: foundUser,
            likes: likes,
        });
    })
});

// User edit
router.get('/:id/edit', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err || !foundUser) {
            req.flash('error', 'User not found!');
            console.log(err);
            console.log('*** User edit routing');
            return res.redirect('/campgrounds');
        }
        res.render('users/edit', {
            user: foundUser
        });
    })
});

// User update
router.put('/:id', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    var newUser = {
        name: req.body.name,
        email: req.body.email, // Delete later
        photo: req.body.photo,
        bio: req.body.bio,
        isAdmin: false,
    };
    if (req.body.admin === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }
    User.findByIdAndUpdate(req.params.id, newUser, (err, updatedUser) => {
        if (err || !updatedUser) {
            req.flash('error', 'User not found!');
            console.log(err);
            console.log('*** User update routing');
            return res.redirect('/campgrounds');
        }
        // console.log(updatedUser);
        res.redirect('/users/' + req.params.id);
    })
});

// User change password
router.get('/:id/change', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    res.render('users/change', {
        userId: req.params.id
    });
});

// User reset password
router.post('/:id/change', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err || !foundUser) {
            req.flash('error', 'User not found!');
            console.log(err);
            console.log('*** User reset routing');
            return res.redirect('/campgrounds');
        }
        foundUser.changePassword(req.body.oldPassword, req.body.newPassword, (err, updatedUser) => {
            if (err) {
                req.flash('error', 'Old password does not matched!');
                return res.redirect('/campgrounds');
            }
            req.flash('success', 'Successfully changed your password');
            res.redirect('/users/' + req.params.id);
        })
    })
})

module.exports = router;