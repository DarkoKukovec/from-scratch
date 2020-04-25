const fs = require('fs');
const { decode } = require('../bencode');
const { normalizeTorrent, normalizeMagnet, trackerRequest } = require('./helpers');

const file = process.argv[2];
let data;

if (file.startsWith('magnet:')) {
  data = normalizeMagnet(file);
} else {
  const bin = fs.readFileSync(file);
  data = normalizeTorrent(decode(bin));
}

console.log(data);

// TODO: Communicate with trackers
// trackerRequest(data).then(console.log, console.error);
