const fs = require('fs');
const engine = require('.');

const programPath = process.argv[2];
const program = fs.readFileSync(programPath, 'utf-8');

console.log(engine(program));
