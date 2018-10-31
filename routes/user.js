var express = require('express'),
    passport = require('passport');

// include model
var User = require('../models/user');

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
        photo: req.body.photo
    }), req.body.password, (err, newUser) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            passport.authenticate('local')(req, res, () => {
                // console.log(newUser)
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
}));

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/campgrounds');
})

module.exports = router;