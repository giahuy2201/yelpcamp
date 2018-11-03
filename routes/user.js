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
router.post('/reset', (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            // console.log(token);
            User.findOne({
                email: req.body.email
            }, function (err, foundUser) {
                if (!foundUser) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/users/forgot');
                }

                foundUser.resetPasswordToken = token;
                foundUser.resetPasswordExpires = Date.now() + 3600000;

                foundUser.save(function (err) {
                    done(err, token, foundUser);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS,
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.EMAIL,
                subject: 'YelpCamp Password Reset',
                text: 'You are receiving this because you (or someone else) requested the reset of you YelpCamp acount\'s password.\n' +
                    'Please click the following link, or paste it into your browser to compete the process\n' +
                    'http://' + req.header('host') + '/users/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and you password will remain unchanged.',
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) {
            return next(err);
        };
        res.redirect('/users/forgot');
    });
});

// Reset password with token
router.get('/reset/:token', (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token
    }, (err, foundUser) => {
        if (!foundUser) {
            req.flash('error', 'Password reset token is invalid or expired.');
            return res.redirect('/users/forgot');
        }
        res.render('users/reset', {
            token: req.params.token
        });
    })
});

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, (err, foundUser) => {
                if (!foundUser) {
                    req.flash('error', 'Password reset token is invalid or expired.');
                    return res.redirect('back');
                }

                foundUser.setPassword(req.body.newPassword, (err) => {
                    foundUser.resetPasswordToken = undefined;
                    foundUser.resetPasswordExpires = undefined;

                    foundUser.save((err) => {
                        req.logIn(foundUser, (err) => {
                            done(err, foundUser);
                        });
                    });
                });
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASS,
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.EMAIL,
                subject: 'YelpCamp password has been changed',
                text: 'Hello, ' + user.name +
                    '\nThis is a confirmation that your password of your YelpCamp account ' + user.username + ' has just been changed.\n',
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/campgrounds');
    })
})

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