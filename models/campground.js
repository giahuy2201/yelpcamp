var mongoose = require('mongoose');

// create campground schema
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
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