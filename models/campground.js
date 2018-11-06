var mongoose = require('mongoose');

// create campground schema
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    website: String,
    telephone: String,
    location: String,
    lat: Number,
    lng: Number,
    created: {
        type: Date,
        default: Date.now,
    },
    ratings: {}, // object (username) as a key
    hours: {}, // doublecheck later
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// create campground model
module.exports = mongoose.model('Campground', campgroundSchema);