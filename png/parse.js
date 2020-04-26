const fs = require('fs');
const parser = require('.');

function pxToColor(px) {
  return `#${px.map((val) => val.toString(16).padStart(2, '0')).join('')}`;
}

const file = process.argv[2];
const data = fs.readFileSync(file);
const output = parser(data);
console.log(output);
fs.writeFileSync(
  'output.html',
  `<style type="text/css">i{display:inline-block;width:1px;height:1px}</style><div style="width:${
    output.info.width
  }px;height:${output.info.height}px;outline:1px solid black;">${output.pixels
    .map((px) => `<i style="background:${pxToColor(px)}"></i>`)
    .join('')}</div>`,
);
