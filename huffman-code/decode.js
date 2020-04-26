const { decode } = require('.');

const input = process.argv[2].split('').map((item) => item === '1');
const mapping = {};
process.argv[3].split(',').forEach(
  (item) =>
    (mapping[item.slice(0, 1)] = item
      .slice(1)
      .split('')
      .map((item) => item === '1')),
);
const length = parseInt(process.argv[4], 10);
console.log(decode(input, mapping, length).join(''));
