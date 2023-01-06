// IMPORT MONGOOSE
const mongoose = require("mongoose");

// Use mongoose to create a cart schema
const cartItemSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Each cart must belong to a user"],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Each cart item must have a product Id"],
  },
  qty: {
    type: Number,
    min: [1, "Product quantity must be at least 1"],
  },
});

// Use mongoose and Schema to create the cart model
const CartItem = mongoose.model("CartItem", cartItemSchema);

// Export model to be used in other parts of our application
module.exports = CartItem;
