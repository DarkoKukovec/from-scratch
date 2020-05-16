const fs = require('fs');
const parser = require('.');

function pxToColor(px) {
  return `#${px.map((val) => val.toString(16).padStart(2, '0')).join('')}`;
}

const file = process.argv[2];
const data = fs.readFileSync(file);
const output = parser(data);
fs.writeFileSync(
  'output.html',
  `<style type="text/css">i{display:inline-block;width:1px;height:1px}</style><div style="width:${
    output.info.width
  }px;height:${output.info.height}px;outline:1px solid black;">
  <div style="width:1px;height:1px;box-shadow:${output.pixels.map(
    (px, index) =>
      `${index % output.info.width}px ${Math.floor(index / output.info.width)}px ${pxToColor(px)}`,
  )}"></div>
    </div>`,
);
