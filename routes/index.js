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
    res.render('register');
});

// Register authentication
router.post('/users', (req, res) => { // DOUBLE CHECK THIS
    var newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        photo: req.body.photo,
        bio: req.body.bio,
    });
    if (req.body.admin === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, newUser) => {
        if (err || !newUser) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** User create routing');
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, () => {
            // console.log(newUser);
            req.flash('success', 'Successfully! Welcome to YelpCamp, ' + req.body.name);
            res.redirect(middleware.beforeLogin);
        })
    })
})

// Login route
router.get('/login', (req, res) => {
    res.render('login');
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
    res.render('forgot');
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
                    return res.redirect('/forgot');
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
                    'http://' + req.header('host') + '/reset/' + token + '\n\n' +
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
        res.redirect('/forgot');
    });
});

// Reset password with token
router.get('/reset/:token', (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token
    }, (err, foundUser) => {
        if (!foundUser) {
            req.flash('error', 'Password reset token is invalid or expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
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
});


// Home page
router.get('/', (req, res) => {
    res.render('../views/landing');
});

// About page
router.get('/about', (req, res) => {
    res.render('../views/about');
});

// Other page
router.get('/:abc', (req, res) => {
    res.send('Page not found');
});

module.exports = router;