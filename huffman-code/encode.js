const { encode } = require('.');

const input = process.argv[2].split('');
const { output, mapping } = encode(input);
console.log(
  output.map((bit) => (bit ? 1 : 0)).join(''),
  Object.keys(mapping)
    .map((key) => `${key}${mapping[key].map((bit) => (bit ? 1 : 0)).join('')}`)
    .join(','),
  input.length,
);
