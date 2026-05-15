const mongoose = require('mongoose');
const {category} = require('../helper/categorydata');

const validateCategory = (categories) => {
    return categories.every(category => categoryArray[category])
}


const validateSubCategory = function(subCategories) {
  const categories = this.category

  if (!Array.isArray(categories) || !Array.isArray(subCategories)) {
    return false
  }

  const allowedSubs = categories.flatMap(
    category => categoryArray[category] || []
  )

  return subCategories.every(sub =>
    allowedSubs.includes(sub)
  )
}


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
            message: 'It contains invalid category'
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


module.exports = mongoose.model('UserCategory', categorySchema)