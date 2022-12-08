// Create a function to catch errors inside of async functions
const catchAsyncFn = function (asyncFn) {
  return (req, res, next) => {
    asyncFn(req, res, next).catch((error) => next(error));
  };
};

// EXPORT CATCHASYNC TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = catchAsyncFn;
