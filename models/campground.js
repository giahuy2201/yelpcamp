var mongoose = require('mongoose');
var random = require('mongoose-simple-random');

// create campground schema
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    hresImage: String,
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
    likes: [String], // store user id who liked this
    likesLength: Number,
    ratings: {}, // object (username) as a key
    ratingsAverage: Number,
    ratingsLength: Number,
    hours: {}, // doublecheck later
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    commentsLength: Number,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
campgroundSchema.plugin(random);

// create campground model
module.exports = mongoose.model('Campground', campgroundSchema);