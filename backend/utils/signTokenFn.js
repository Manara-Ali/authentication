// IMPORT JWT TOKEN
const jwt = require("jsonwebtoken");

// Create a function to sign jwt token
const signToken = (id) => {
  // Sign JWT token
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_DURATION,
  });

  // Return jwt token
  return token;
};

// EXPORT FUNCTION TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = signToken;
