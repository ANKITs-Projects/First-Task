const mongoose = require('mongoose')


const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    },
    text: {
        type: String,
        require: true
    },
    mediaUrl: [{
        type: String,
        require: true
    }]

}, {timestamps: true})

module.exports = mongoose.model("UserPost", postSchema);