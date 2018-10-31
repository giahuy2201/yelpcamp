var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

// create user schema
var userSchema = new mongoose.Schema({
    name: String,
    photo: String,
    bio: String,
    campgrounds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground'
    }]
});

userSchema.plugin(passportLocalMongoose);

// create user model
module.exports = mongoose.model('User', userSchema);