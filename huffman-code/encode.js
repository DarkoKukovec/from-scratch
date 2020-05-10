const { encode } = require('.');

const input = process.argv[2].split('');
const deflate = process.argv[3] === 'deflate';
const { output, mapping } = encode(input, deflate);

if (deflate) {
  console.log(
    output.map((bit) => (bit ? 1 : 0)).join(''),
    Object.keys(mapping)
      .map((key) => mapping[key].length)
      .join(','),
    Object.keys(mapping).sort().join(''),
  );
  console.log(mapping);
} else {
  console.log(
    output.map((bit) => (bit ? 1 : 0)).join(''),
    Object.keys(mapping)
      .map((key) => `${key}${mapping[key].map((bit) => (bit ? 1 : 0)).join('')}`)
      .join(','),
  );
}
