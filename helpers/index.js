function byteArrayToNumber(bytes) {
  const data = Array.from(bytes);
  let value = 0;
  let pow = 0;

  while (data.length) {
    value += data.pop() * Math.pow(256, pow);
    pow++;
  }

  return value;
}

function byteArrayToString(bytes) {
  return String.fromCharCode(...bytes);
}

module.exports = {
  byteArrayToNumber,
  byteArrayToString,
};
