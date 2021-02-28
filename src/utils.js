// Create a 2D array filled with zeros
function getFilledArray(width, height, val = 0) {
  return Array.from(new Array(height), () => Array(width).fill(val));
}

// Loop over 2D array and run the function against each item
function map2d(array, fn) {
  return array.map(innerArray => innerArray.map(fn));
}

// Flatten the given array and convert the bits into bytes
function packBits(array) {
  let flatArr = array.flat();
  const returnArr = [];

  while (flatArr.length > 0) {
    // Grab the first 8 entries (bits) and join them into a string 
    // Then pad the end with zeros if it's less than 8 entries
    const bitsStr = flatArr.slice(0, 8).join('').padEnd(8, 0);
    const byte = parseInt(bitsStr, 2); // convert from binary to decimal
    returnArr.push(byte);

    flatArr = flatArr.slice(8);
  }

  return returnArr;
}

module.exports = { getFilledArray, map2d, packBits };
