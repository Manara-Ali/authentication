// IMPORT EXPRESS TO CREATE AN EXPRESS APPLICATION
const express = require("express");

// CREATE A VARIABLE THAT REPRESENT OUR EXPRESS APPLICATION
const app = express();

// Create a port to listen to the request/response cycle
const port = 5000;

// Start listen for the request/response cycle
app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});
