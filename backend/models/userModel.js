// IMPORT CRYPTO
const crypto = require("crypto");

// IMPORT MONGOOSE TO CREATE USER SCHEMA AND MODEL
const mongoose = require("mongoose");

// IMPORT BCRYPTJS TO HELP HASH USERS PASSWORD
const bcrypt = require("bcryptjs");

// IMPORT VALIDATOR TO HELP WITH DATA VALIDATION
const validator = require("validator");

// Use mongoose to create user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Each user must have a name"],
      validate: {
        validator: function (value) {
          return value.length > 1;
        },
        message: "Name must be more than a single character",
      },
    },
    email: {
      type: String,
      required: [true, "Each user must have an email address"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address! Please provide valid email address.",
      },
    },
    password: {
      type: String,
      required: [true, "Password is a required field"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password Confirm is a required field"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Both password and password confirm must be the same!",
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpirationDate: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a document middleware to to hash user password
userSchema.pre("save", async function (next) {
  // Assuming the password was not changed
  if (!this.isModified("password")) {
    // Break out of this middleware
    next();
    return;
  }

  // Hash user password
  this.password = await bcrypt.hash(this.password, 12);

  // Prevent password confirm to make it to the database
  this.passwordConfirm = undefined;

  // Call the next middleware in the stack
  next();
});

// Create an instance method to compare passwords
userSchema.methods.comparePasswords = async function (
  plainPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Create an instance method to verify the last time user's password was changed
userSchema.methods.wasPasswordChanged = function (JWTTimestamp) {
  // Assuming the password was changed at some point
  if (this.passwordChangedAt) {
    // Retrieve the password change timestamp
    const passwordChangeTimestamp = Number.parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    return passwordChangeTimestamp > JWTTimestamp;
  }

  // Assuming the password was not changed
  return false;
};

// Create an instance method to generate password reset tokens
userSchema.methods.generateResetToken = function () {
  // Create a password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the reset token
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Store the hashedToken to the database
  this.passwordResetToken = hashedResetToken;

  // Update to reset token expiration date
  this.passwordResetTokenExpirationDate = Date.now() + 10 * 60 * 1000;

  // Return the reset token to the user
  return resetToken;
};

// Create a middleware to specify when a password was changed
userSchema.pre("save", function (next) {
  // Assuming the password was not modified or the document is new
  if (!this.isModified("password") || this.isNew) {
    // Do nothing and call the next middleware in the stack
    next();

    // Break
    return;
  }

  // Specify when the password was changed
  this.passwordChangedAt = Date.now() - 1000;

  // Call the next middleware in the stack
  next();
});

// Create a query middleware to hide inactive users
userSchema.pre(/^find/, function (next) {
  this.find({
    active: { $ne: false },
  });

  // Call the next middleware in the stack
  next();
});

// Use mongoose and schema to create model
const User = mongoose.model("User", userSchema);

// EXPORT USER MODEL
module.exports = User;
