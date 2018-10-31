var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

// create user schema
var userSchema = new mongoose.Schema({});

userSchema.plugin(passportLocalMongoose);

// create user model
module.exports = mongoose.model('User', userSchema);