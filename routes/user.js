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
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User show routing');
            res.redirect('back');
        } else {
            res.render('users/show', {
                user: foundUser
            });
        }
    })
});

// User edit
router.get('/:id/edit', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User edit routing');
            res.redirect('back');
        } else {
            res.render('users/edit', {
                user: foundUser
            });
        }
    })
});

// User update
router.put('/:id', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    var newUser = {
        name: req.body.name,
        email: req.body.email, // Delete later
        photo: req.body.photo,
        bio: req.body.bio,
    };
    User.findByIdAndUpdate(req.params.id, newUser, (err, updatedUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User update routing');
            res.redirect('back');
        } else {
            // console.log(updatedUser);
            res.redirect('/users/' + req.params.id);
        }
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
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User reset routing');
            res.redirect('back');
        } else {
            foundUser.changePassword(req.body.oldPassword, req.body.newPassword, (err, updatedUser) => {
                if (err) {
                    req.flash('error', 'Old password does not matched!');
                    res.redirect('back');
                } else {
                    req.flash('success', 'Successfully changed your password');
                    res.redirect('/users/' + req.params.id);
                }
            })
        }
    })
})

module.exports = router;