const { decode } = require('.');
const { parseBitsSting } = require('../helpers');

const input = parseBitsSting(process.argv[2]);
const alphabet = process.argv[4] ? process.argv[4].split('') : null;

let mapping = {};

if (alphabet) {
  mapping = process.argv[3].split(',').map((val) => parseInt(val, 10));
} else {
  process.argv[3].split(',').forEach(
    (item) =>
      (mapping[item.slice(0, 1)] = item
        .slice(1)
        .split('')
        .map((item) => item === '1')),
  );
}

console.log(decode(input, mapping, alphabet).join(''));
