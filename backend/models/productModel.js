// IMPORT MONGOOSE TO CREATE USER SCHEMA AND MODEL
const mongoose = require("mongoose");

// Use mongoose to create user schema
const productSchema = new mongoose.Schema(
  {
    // Who created the product
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Each product must belong to a user"],
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Each product must have a name"],
    },
    image: {
      type: String,
      required: [true, "Each product must have an image"],
    },
    brand: {
      type: String,
      required: [true, "Each product must have a brand"],
    },
    category: {
      type: String,
      required: [true, "Each product must have a category"],
    },
    description: {
      type: String,
      required: [true, "Each product must have a description"],
    },
    reviews: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Review",
      },
    ],
    ratingsAverage: {
      type: Number,
      required: [true, "Each product must have a rating average"],
      default: 4.5,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
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
const Product = mongoose.model("Product", productSchema);

// EXPORT USER MODEL
module.exports = Product;
