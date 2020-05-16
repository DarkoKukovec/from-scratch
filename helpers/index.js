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

function extractBits(value, start, length) {
  return (value >> start) & (2 ** length - 1);
}

function stringifyBits(bits) {
  return bits.map(Number).join('');
}

function parseBitsSting(str) {
  return str.split('').map(Boolean);
}

function bitsToNumber(bits) {
  let value = 0;

  bits.forEach((bit) => {
    value *= 2;
    value += bit ? 1 : 0;
  });

  return value;
}

function numberToBits(number, minLength) {
  const bits = [];

  let val = number;
  while (val) {
    bits.unshift(val % 2 === 1);
    val = val >> 1;
  }

  while (bits.length < minLength) {
    bits.unshift(false);
  }

  return bits;
}

function byteToBit(byte) {
  let val = byte;
  return Array(8)
    .fill(0)
    .map(() => {
      const bit = val % 2;
      val = val >> 1;
      return bit;
    })
    .reverse();
}

function byteArrayToBits(byteArray) {
  return byteArray.map(byteToBit).flat();
}

function bitsToByteArray(bits, byteSize = 8) {
  const bytes = [];

  for (let pos = 0; pos < bits.length; pos += byteSize) {
    bytes.push(bitsToNumber(bits.slice(pos, pos + byteSize)));
  }

  return bytes;
}

module.exports = {
  byteArrayToNumber,
  byteArrayToString,
  extractBits,
  stringifyBits,
  parseBitsSting,
  bitsToNumber,
  byteToBit,
  byteArrayToBits,
  numberToBits,
  bitsToByteArray,
};
