// IMPORT MONGOOSE TO CREATE USER SCHEMA AND MODEL
const mongoose = require("mongoose");

// Use mongoose to create user schema
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Each review must have a name"],
    },
    rating: {
      type: Number,
      required: [true, "Each review must have a rating"],
    },
    comment: {
      type: String,
      required: [true, "Password is a required field"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Use mongoose and schema to create model
const Review = mongoose.model("Review", reviewSchema);

// EXPORT review MODEL
module.exports = Review;
