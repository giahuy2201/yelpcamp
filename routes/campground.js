var express = require('express'),
    nodeGeocoder = require('node-geocoder'),
    multer = require('multer'),
    cloudinary = require('cloudinary');

// include models
var Campground = require('../models/campground'),
    User = require('../models/user'),
    middleware = require('../middleware');

// for geocoder
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
};
var geocoder = nodeGeocoder(options);

// for Hours
var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// Campgrounds page
router.get('/', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to do stuff with navbar
    Campground.find().sort({
        created: -1
    }).populate('author').exec((err, campgrounds) => {
        if (err || !campgrounds) {
            console.log(err);
            console.log('*** Campground index routing');
            req.flash('error', 'Something went wrong! Try again later');
            return res.redirect('/campgrounds');
        }
        Campground.countDocuments((err, count) => {
            if (err) {
                console.log(err);
                console.log("*** Count campgrounds");
                return;
            }
            if (!count) {
                return res.render('campgrounds/index', {
                    campgrounds: campgrounds,
                    carousel: [],
                    title: 'All Campgrounds',
                });
            } else {
                // get some random for carousel
                Campground.findRandom({}, {}, {
                    limit: 3
                }, (err, randomCampgounds) => {
                    if (err || !randomCampgounds) {
                        console.log(err);
                        console.log("*** Find random campgrounds");
                        return;
                    }
                    return res.render('campgrounds/index', {
                        campgrounds: campgrounds,
                        carousel: randomCampgounds,
                        title: 'All Campgrounds',
                    });
                })
            }
        });
    })
});

// Campgrounds new
router.get('/new', middleware.isLoggedIn, (req, res) => {
    return res.render('campgrounds/new', {
        weekdays: weekdays,
        title: 'New Campground'
    });
});

// Campground create
router.post('/', middleware.isLoggedIn, upload.single('image'), (req, res) => {
    // make campground variable
    var newCampground = req.body.campground; // name, desc, webs,tel,price
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('/campgrounds/new');
        }
        newCampground.lat = data[0].latitude;
        newCampground.lng = data[0].longitude;
        newCampground.location = data[0].formattedAddress;
        // get hours
        var hours = {};
        for (var i in req.body.dayCheck) {
            var day = {
                open: req.body.dayOpenTime[i],
                close: req.body.dayCloseTime[i],
            }
            hours[i] = day;
        }
        newCampground.hours = hours;
        // start doing this
        User.findById(req.user._id, (err, foundUser) => {
            if (err || !foundUser) {
                req.flash('error', 'User not found!');
                console.log(err);
                console.log('*** Campground create routing');
                return res.redirect('/campgrounds');
            }
            // update author
            newCampground.author = foundUser;
            Campground.create(newCampground, (err, newCampground) => {
                if (err || !newCampground) {
                    req.flash('error', 'Campground not found!');
                    console.log(err);
                    console.log('*** Campground create routing');
                    return res.redirect('/campgrounds');
                }
                // update campgrounds
                foundUser.campgrounds.push(newCampground);
                foundUser.campgroundsLength = foundUser.campgrounds.length;
                foundUser.save();
                // upload image
                cloudinary.v2.uploader.upload(req.file.path, {
                    public_id: newCampground._id, // campground image's ID is the campground's ID
                }, (err, uploadedImage) => {
                    if (err || !uploadedImage) {
                        req.flash('error', 'Something went wrong with your image!');
                        newCampground.save();
                        return res.redirect('/campgrounds');
                    }
                    newCampground.image = (uploadedImage.secure_url).replace('/upload', '/upload/w_450,h_300,c_fill'); // save image url
                    newCampground.hresImage = uploadedImage.secure_url; // image with high resolution & no crop
                    newCampground.save();
                    req.flash('success', 'Your campground was added!');
                    return res.redirect('/campgrounds');
                });
            })
        })
    })
})

// Campground show
router.get('/:id', (req, res) => {
    middleware.beforeLogin = req.originalUrl; // save url in case user want to login
    Campground.findById(req.params.id).populate([{
        path: 'comments',
        populate: {
            path: 'author',
        }
    }, {
        path: 'author',
    }]).exec((err, foundCampground) => {
        if (err || !foundCampground) {
            console.log(err);
            console.log('*** Campground show routing');
            req.flash('error', 'Campground not found!');
            return res.redirect('/campgrounds');
        }
        return res.render('campgrounds/show', {
            campground: foundCampground,
            weekdays: weekdays,
            title: foundCampground.name + ' - ' + foundCampground.author.name,
        });
    })
});

// Campground edit
router.get('/:id/edit', middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Campground edit routing');
            return res.redirect('/campgrounds');
        }
        return res.render('campgrounds/edit', {
            campground: foundCampground,
            weekdays: weekdays,
            title: foundCampground.name + ' - Edit'
        });
    })
});

// Campground update
router.put('/:id', middleware.isLoggedIn, middleware.checkCampgroundOwnership, upload.single('image'), (req, res) => {
    var updatedCampground = req.body.campground;
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('/campgrounds/' + req.params.id);
        }
        // update location
        updatedCampground.lat = data[0].latitude;
        updatedCampground.lng = data[0].longitude;
        updatedCampground.location = data[0].formattedAddress;
        // get hours
        var hours = {};
        for (var i in req.body.dayCheck) {
            var day = {
                open: req.body.dayOpenTime[i],
                close: req.body.dayCloseTime[i],
            }
            hours[i] = day;
        }
        updatedCampground.hours = hours;
        Campground.findByIdAndUpdate(req.params.id, updatedCampground, (err, updatedCampground) => {
            if (err || !updatedCampground) {
                req.flash('error', 'Campground not found!');
                console.log(err);
                console.log('*** Campground update routing');
                return res.redirect('/campgrounds');
            }
            if (!req.file) {
                updatedCampground.save();
                return res.redirect('/campgrounds/' + req.params.id);
            }
            // upload image
            cloudinary.v2.uploader.upload(req.file.path, {
                public_id: req.params.id,
                invalidate: true,
            }, (err, uploadedImage) => {
                if (err) {
                    updatedCampground.save();
                    req.flash('error', 'Something went wrong with your image!');
                    return res.redirect('/campgrounds');
                }
                updatedCampground.image = uploadedImage.secure_url; // save image url
                updatedCampground.save();
                return res.redirect('/campgrounds/' + req.params.id);
            });

        })
    });
});

// Campground delete
router.delete('/:id', middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found!');
            console.log(err);
            console.log('*** Campground delete routing');
            return res.redirect('/campgrounds');
        }
        User.findById(foundCampground.author._id, (err, foundUser) => {
            if (err || !foundUser) {
                req.flash('error', 'Something went wrong!');
                console.log(err);
                console.log('*** Campground delete in User routing');
                return res.redirect('/campgrounds');
            }
            // delete the reference in the carrying user
            var campgroundIndex = foundUser.campgrounds.indexOf(req.params.id);
            // console.log(campgroundIndex);
            foundUser.campgrounds.splice(campgroundIndex, 1);
            foundUser.campgroundsLength = foundUser.campgrounds.length;
            foundUser.save();
            Campground.deleteOne(foundCampground, (err) => {
                // console.log(foundUser);
                req.flash('success', 'Campground deleted!');
                return res.redirect('/campgrounds');
            });;
        })
    })
});
module.exports = router;