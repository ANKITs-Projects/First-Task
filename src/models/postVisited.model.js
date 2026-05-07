const mongoose = require('mongoose')


const postVisitedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPost',
        require: true,
        index: true
    }

}, {timestamps: true})

module.exports = mongoose.model("PostVisited", postVisitedSchema);