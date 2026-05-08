const mongoose = require('mongoose')

const userFeedCategory = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    },
    categories: {
        type: [String],
        default: "General"
    }
}, {timestamps: true})

module.exports = mongoose.model("UserFeedCategory", userFeedCategory);

