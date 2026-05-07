const mongoose = require('mongoose')


const commentsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    },
    post: {
         type: mongoose.Schema.Types.ObjectId,
        ref: "UserPost"
    },
    comments: {
        type: String,
        require: true
    }
}, {timestamps: true})

module.exports = mongoose.model("UserComment", commentsSchema);