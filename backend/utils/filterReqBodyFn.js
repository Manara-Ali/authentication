const filterReqBody = (obj, ...args) => {
  // Create a filtered object
  const filteredObj = {};

  Object.keys(obj).forEach((element) => {
    if (args.includes(element)) {
      filteredObj[element] = obj[element];
    }
  });

  return filteredObj;
};

// EXPORT THE FUNCTION TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = filterReqBody;
