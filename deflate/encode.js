const { encode } = require('.');

const input = process.argv[2].split('');
const output = encode(input);
console.log(output);
