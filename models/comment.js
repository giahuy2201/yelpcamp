var mongoose = require('mongoose');

// create comment schema
var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
});

// create comment model
module.exports = mongoose.model('Comment', commentSchema);