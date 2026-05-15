const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    categories: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedCategory",
    },
    avatar: {
      type: String,
    },
    banner: {
      type: String
    },

    followersCount: {
      type: Number,
      min: 0,
      default: 0
    },
    followingCount: {
      type: Number,
      min: 0,
      default: 0
    },

    joinedCommunity:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Community"
    },


    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "User"],
      default: "User",
    },









    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Users", userSchema);
