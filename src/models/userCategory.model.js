const mongoose = require('mongoose');
const categoryArray = require('../helper/categorydata');

const validateCategory = (categories) => {
    return categories.every(category => categoryArray[category])
}


const validateSubCategory = function(subCategories) {

    const categories = this.feedCategory
    for (const sub of subCategories) {

        const valid = categories.some(category =>
            sub.includes(category)
        )
        if (!valid) {
            return false
        }
    }
    return true
};


const categorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        require: true,
    },
    category: {
        type: [String],
        validate: {
            validator: validateCategory,
            message: 'contains invalid category'
        }
    },
    subCategory: {
        type: [String],
        validate: {
            validator: validateSubCategory,
            message: 'Invalid sub category'
        }
    }

}, { timestamps: true })


module.exports = mongoose.model('FeedCategory', categorySchema)