var express = require('express'),
    passport = require('passport');

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
        photo: req.body.photo,
        bio: req.body.bio,
    }), req.body.password, (err, newUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            res.redirect('back');
        } else {
            passport.authenticate('local')(req, res, () => {
                // console.log(newUser);
                req.flash('success', 'Successfully! Welcome to YelpCamp, ' + req.body.name);
                res.redirect('/campgrounds');
            })
        }
    })
})

// Login route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Login authentication
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/users/login',
    failureMessage: true,
    failureFlash: true,
}));

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out! Bye bye ');
    res.redirect('/campgrounds');
});

// User show
router.get('/:id', (req, res) => {
    User.findById(req.params.id).populate('campgrounds').exec((err, foundUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            res.redirect('back');
        } else {
            res.render('users/show', {
                user: foundUser
            });
        }
    })
});

// User edit
router.get('/:id/edit', middleware.checkProfileOwnership, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            res.redirect('back');
        } else {
            res.render('users/edit', {
                user: foundUser
            });
        }
    })
});

// User update
router.put('/:id', middleware.checkProfileOwnership, (req, res) => {
    var newUser = {
        name: req.body.name,
        photo: req.body.photo,
        bio: req.body.bio,
    };
    User.findByIdAndUpdate(req.params.id, newUser, (err, updatedUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            res.redirect('back');
        } else {
            // console.log(updatedUser);
            res.redirect('/users/' + req.params.id);
        }
    })
});

// User change password
router.get('/:id/reset', middleware.checkProfileOwnership, (req, res) => {
    res.render('users/reset', {
        userId: req.params.id
    });
});

// User reset password
router.post('/:id/reset', middleware.checkProfileOwnership, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
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