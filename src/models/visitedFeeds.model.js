const mongoose = require('mongoose')


const visitedFeedsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true,
        index: true
    },
    timeRange:{
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length === 2;
            }
        }
    }

}, {timestamps: true})

module.exports = mongoose.model("visitedFeeds", visitedFeedsSchema);