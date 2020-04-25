const fs = require('fs');
const engine = require('.');

const programPath = process.argv[2];
const program = fs.readFileSync(programPath, 'utf-8');
const input = process.argv[3] || '';

console.log(engine(program.split(''), input));
