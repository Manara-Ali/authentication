process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION ERROR");
  console.error("Server is now shutting down...", "🔥");
  console.error(error.name, error.message);
  console.log(error.stack);
  process.exit(1);
});

// IMPORT MONGOOSE
const mongoose = require("mongoose");

// IMPORT DOTENV MODULE
const dotenv = require("dotenv");

// Connect to our configuration file
dotenv.config({
  path: `${__dirname}/config.env`,
});

// IMPORT EXPRESS APPLICATION
const app = require("./app");

// Create a variable that represent our database
const DB = mongoose
  .connect(
    process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
  )
  .then(() => {
    console.log("DB CONNECTED!");
  });

// Create a port to listen to the request/response cycle
const port = 5000;

// Start listen for the request/response cycle
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});

// Handle async errors
process.on("unhandledRejection", (error) => {
  console.log(
    "UNHANDLE PROMISE REJECTION ERROR",
    "Shutting down the server...",
    "💥"
  );
  console.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
