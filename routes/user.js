var express = require('express'),
    passport = require('passport');

var async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto');

// include model
var User = require('../models/user'),
    middleware = require('../middleware');

var router = express.Router();

// Register route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Register authentication
router.post('/', (req, res) => { // DOUBLE CHECK THIS
    User.register(new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        photo: req.body.photo,
        bio: req.body.bio,
    }), req.body.password, (err, newUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User create routing');
            res.redirect('back');
        } else {
            passport.authenticate('local')(req, res, () => {
                // console.log(newUser);
                req.flash('success', 'Successfully! Welcome to YelpCamp, ' + req.body.name);
                res.redirect(middleware.beforeLogin);
            })
        }
    })
})

// Login route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Login authentication
router.post('/login', (req, res, next) => { // DIVE DEEP LATER
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User login routing');
            return res.redirect('back');
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('back');
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash('error', 'Something went wrong! Try again later');
                console.log(err);
                console.log('*** User login routing');
                return res.redirect('back');
            }
            return res.redirect(middleware.beforeLogin); // back to the last page
        })
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out! Bye bye ');
    res.redirect(middleware.beforeLogin); // back to what they were on
});

// Forgot password
router.get('/forgot', (req, res) => {
    res.render('users/forgot');
});

// Reset password
// router.post('/reset', (req, res) => {

// })

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
router.get('/:id/reset', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    res.render('users/reset', {
        userId: req.params.id
    });
});

// User reset password
router.post('/:id/reset', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
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