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
      required: true
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "User"],
      default: "User"
    },
    refreshToken: {
      type: String,
      select: false
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Users", userSchema);
