var express = require('express'),
    passport = require('passport'),
    multer = require('multer'),
    cloudinary = require('cloudinary');

var async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto');

// include model
var User = require('../models/user'),
    Campground = require('../models/campground'),
    middleware = require('../middleware');

// Image upload settings
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, callback) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
}
var upload = multer({
    storage: storage,
    fileFilter: imageFilter
});

var router = express.Router();

// Search page
router.get('/search', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to do stuff with navbar
    // var q = (req.query.q).substring(1); // ignore the first character to avoid missing Capitial words.
    var q = (req.query.q);
    Campground.find({
        $or: [{
            name: {
                $regex: q // check if name contain this word q
            }
        }, {
            description: {
                $regex: q
            }
        }, {
            location: {
                $regex: q
            }
        }]
    }).populate('author').exec((err, campgrounds) => {
        // console.log(campgrounds);
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Campground search routing');
            return res.redirect('back');
        }
        // find users too
        User.find({
            $or: [{
                name: {
                    $regex: q // check if name contain this word q
                }
            }, {
                bio: {
                    $regex: q
                }
            }]
        }, (err, users) => {
            if (err) {
                req.flash('error', 'Something went wrong! Try again later');
                console.log(err);
                console.log('*** User search routing');
                return res.redirect('back');
            }
            return res.render('../views/search', {
                campgrounds: campgrounds,
                users: users,
                q: req.query.q,
                title: 'Search Campgrounds',
            });
        })
    });
});

// Explore page
router.get('/explore', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to do stuff with navbar
    Campground.find().exec((err, campgrounds) => {
        if (err) {
            req.flash('error', 'Something went wrong! Try again later');
            console.log(err);
            console.log('*** Campgrounds find routing');
            return res.redirect('back');
        }
        Campground.find().sort({
            "likesLength": -1
        }).limit(3).populate('author').exec((err, likedCampgrounds) => {
            if (err) {
                req.flash('error', 'Something went wrong! Try again later');
                console.log(err);
                console.log('*** Campground likes sort routing');
                return res.redirect('back');
            }
            // console.log(likedCampgrounds);
            Campground.find().sort({
                "ratingsAverage": -1
            }).limit(3).populate('author').exec((err, ratedCampgrounds) => {
                if (err) {
                    req.flash('error', 'Something went wrong! Try again later');
                    console.log(err);
                    console.log('*** Campground rated sort routing');
                    return res.redirect('back');
                }
                Campground.find().sort({
                    "commentsLength": -1
                }).limit(3).populate('author').exec((err, commentedCampgrounds) => {
                    if (err) {
                        req.flash('error', 'Something went wrong! Try again later');
                        console.log(err);
                        console.log('*** Campground commented sort routing');
                        return res.redirect('back');
                    }
                    User.find().exec((err, users) => {
                        if (err) {
                            req.flash('error', 'Something went wrong! Try again later');
                            console.log(err);
                            console.log('*** Users find routing');
                            return res.redirect('back');
                        }
                        User.find().sort({
                            "likesLength": -1
                        }).limit(3).exec((err, likedUsers) => {
                            if (err) {
                                req.flash('error', 'Something went wrong! Try again later');
                                console.log(err);
                                console.log('*** User likes sort routing');
                                return res.redirect('back');
                            }
                            User.find().sort({
                                "campgroundsLength": -1
                            }).limit(3).exec((err, contributingUsers) => {
                                if (err) {
                                    req.flash('error', 'Something went wrong! Try again later');
                                    console.log(err);
                                    console.log('*** User creating sort routing');
                                    return res.redirect('back');
                                }

                                return res.render('../views/explore', {
                                    campgroundsLength: campgrounds.length,
                                    likesLength: count(campgrounds, 'likesLength'),
                                    likedCampgrounds: likedCampgrounds,
                                    ratedCampgrounds: ratedCampgrounds,
                                    commentsLength: count(campgrounds, 'commentsLength'),
                                    commentedCampgrounds: commentedCampgrounds,
                                    usersLength: users.length,
                                    likedUsers: likedUsers,
                                    contributingUsers: contributingUsers,
                                    title: 'Explore Campgrounds',
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Register route
router.get('/register', (req, res) => {
    return res.render('register', {
        title: 'Register',
    });
});

// Register authentication
router.post('/users', upload.single('photo'), (req, res) => { // DOUBLE CHECK THIS
    var newUser = new User({ // Won't work if use req.body.user as an argument
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        photo: req.body.photo,
        bio: req.body.bio,
        likesLength: 0,
    });
    if (req.body.admin === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, newUser) => {
        if (err || !newUser) {
            req.flash('error', err.message);
            console.log(err);
            console.log('*** User create routing');
            return res.redirect('/register');
        }
        // upload image
        cloudinary.v2.uploader.upload(req.file.path, {
            public_id: newUser._id,
        }, (err, uploadedImage) => {
            if (err) {
                newUser.save();
                req.flash('error', 'Something went wrong with your image!');
                return res.redirect('/campgrounds');
            }
            newUser.photo = uploadedImage.secure_url;
            newUser.save();
            passport.authenticate('local')(req, res, () => {
                req.flash('success', 'Successfully! Welcome to YelpCamp, ' + req.body.name);
                return res.redirect(middleware.beforeLogin);
            });
        });
    })
})

// Login route
router.get('/login', (req, res) => {
    return res.render('login', {
        title: 'Login',
    });
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
    return res.redirect(middleware.beforeLogin); // back to what they were on
});

// Forgot password
router.get('/forgot', (req, res) => {
    return res.render('forgot', {
        title: 'Forgot Password',
    });
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
        return res.render('reset', {
            token: req.params.token,
            title: 'Reset Password'
        });
    })
});

// Reset password
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

// Username availability check
// router.get('/username', (req, res) => {
//     if (req.xhr) { // for ajax too
//         User.findOne({
//             username: req.body.username
//         }, (err, foundUser) => {
//             var exist = true;
//             if (foundUser) {
//                 exist = false;
//             }
//             console.log(foundUser);
//             return res.send({
//                 exist: exist
//             });
//         });
//     } else {
//         req.flash('error', 'Huh! It\'s not a good action');
//         return res.redirect('/campgrounds');
//     }
// });

// Home page
router.get('/', (req, res) => {
    return res.render('../views/landing', {
        title: 'Yelpcamp',
    });
});

// About page
router.get('/about', (req, res) => {
    return res.render('../views/about', {
        title: 'About Author',
    });
});

// Other page
router.get('/:abc', (req, res) => {
    return res.send('Page not found');
});

function count(array, field) { // calculate the sum of field in all object element in array
    var sum = 0;
    for (const obj of array) {
        if (obj[field]) {
            sum += obj[field];
        }
    }
    return sum;
}

module.exports = router;