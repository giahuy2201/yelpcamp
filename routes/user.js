var express = require('express'),
    passport = require('passport'),
    multer = require('multer'),
    cloudinary = require('cloudinary');

// include model
var User = require('../models/user'),
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
        // console.log(likes);
        return res.render('users/show', {
            user: foundUser,
            title: foundUser.name,
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
        return res.render('users/edit', {
            user: foundUser,
            title: foundUser.name + ' - Edit',
        });
    })
});

// User update
router.put('/:id', middleware.isLoggedIn, middleware.checkProfileOwnership, upload.single('photo'), (req, res) => {
    var newUser = req.body.user;
    newUser.isAdmin = false;
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
        if (!req.file) {
            updatedUser.save();
            return res.redirect('/campgrounds');
        }
        // upload image
        cloudinary.v2.uploader.upload(req.file.path, {
            public_id: updatedUser._id,
            invalidate: true,
        }, (err, uploadedImage) => {
            if (err || !uploadedImage) {
                updatedUser.save();
                req.flash('error', 'Something went wrong with your image!');
                return res.redirect('/campgrounds');
            }
            updatedUser.photo = uploadedImage.secure_url;
            updatedUser.save();
            return res.redirect(middleware.beforeLogin);
        });
    })
});

// User change password
router.get('/:id/change', middleware.isLoggedIn, middleware.checkProfileOwnership, (req, res) => {
    return res.render('users/change', {
        userId: req.params.id,
        title: 'Chang Password',
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
            return res.redirect(middleware.beforeLogin);
        })
    })
})

module.exports = router;