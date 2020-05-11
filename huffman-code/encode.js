const { encode } = require('.');
const { stringifyBits } = require('../helpers');

const input = process.argv[2].split('');
const deflate = process.argv[3] === 'deflate';
const { output, mapping } = encode(input, deflate);

if (deflate) {
  console.log(
    stringifyBits(output),
    Object.keys(mapping)
      .map((key) => mapping[key].length)
      .join(','),
    Object.keys(mapping).sort().join(''),
  );
  console.log(mapping);
} else {
  console.log(
    stringifyBits(output),
    Object.keys(mapping)
      .map((key) => `${key}${stringifyBits(mapping[key])}`)
      .join(','),
  );
}
