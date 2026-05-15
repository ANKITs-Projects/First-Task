const mongoose = require("mongoose");
const { mainCategorys } = require("../helper/categorydata");

const validateTag = (tags) => {
  return tags.every((tag) => /^#/.test(tag))
}


const validateCategory = (categories) => {
    return categories.every(category => mainCategorys.includes(category))
}

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      require: true,
    },
    caption: {
      type: String,
      require: true,
    },
    mediaUrl: {
        type: [String],
        require: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: validateTag,
        message: "Each tag must start with #",
      },
    },
    likes: {
      type: Number,
      min: 0,
      default: 0
    },
    postCategory: {
        type: [String],
        default: ["General"],
        validate: {
            validator: validateCategory,
            message: 'Post contains invalid category'
        }
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserPost", postSchema);
