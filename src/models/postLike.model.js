const mongoose = require('mongoose')


const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    },
    postid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPost',
        require: true
    },
    isliked: {
        type: Boolean,
        default: true
    }

}, {timestamps: true})

module.exports = mongoose.model("Postlike", postSchema);