var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

// create user schema
var userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    photo: String,
    bio: String,
    campgrounds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground'
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);

// create user model
module.exports = mongoose.model('User', userSchema);