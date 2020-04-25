const url = require('url');
// const udp = require('dgram');
const http = require('http');
const https = require('https');
const { port } = require('./config');

function stringify(data) {
  return data && String.fromCharCode(...data);
}

const schemas = {
  'http:': http,
  'https:': https,
};

function parseUrl(link) {
  const data = {};
  url
    .parse(link)
    .search.slice(1)
    .split('&')
    .map((item) => {
      const [name, ...val] = item.split('=');
      const value = decodeURIComponent(val.join('='));
      if (data[name]) {
        data[name] = [].concat(data[name], value);
      } else {
        data[name] = value;
      }
    });
  return data;
}

function request(link) {
  const parsed = url.parse(link);
  const schema = schemas[parsed.protocol];
  if (!schema) {
    return;
  }
  // console.log(parsed);

  return new Promise((resolve, reject) => {
    console.log(link);
    // const req = schema.get(link, (res) => {
    //   console.log('res')
    // // })
    const req = schema.request(
      {
        method: 'GET',
        port: parseInt(parsed.port, 10),
        path: parsed.path,
        hostname: parsed.hostname,
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          console.log('chunk', chunk);
          data += chunk;
        });

        res.on('end', () => resolve(data));
      },
    );

    req.on('error', reject);

    req.end();
  });
}

const intialStatus = {
  uploaded: 0,
  downloaded: 0,
  left: 0,
  peer_id: '41233214RQFEWewfessM',
  event: 'started',
};

function normalizeTorrent(data) {
  return {
    topic: {},
    announce: stringify(data.announce),
    trackers: data['announce-list'].map((item) => stringify(item[0])),
    createdAt: data['creation date'],
    createdBy: stringify(data['created by']),
    comment: stringify(data.comment),
    info: {
      files:
        data.info.files &&
        data.info.files.map((file) => ({
          length: file.length,
          path: file.path.map(stringify),
        })),
      length: data.info.length,
      name: stringify(data.info.name),
      pieceLength: data.info['piece length'],
      pieces: data.info.pieces.map((piece) => piece.toString(16)).join(''),
    },
    status: { ...intialStatus },
  };
}

function normalizeMagnet(link) {
  const data = parseUrl(link);

  // ws web seed
  // as acceptable sources
  // xs exact source
  // mt manifest topic
  const [_urn, type, hash] = data.xt.split(':');
  return {
    topic: { type, hash },
    trackers: data.tr,
    info: {
      keywords: data.kt,
      name: data.dn,
      length: data.xl,
    },
    status: { ...intialStatus },
  };
}

async function trackerRequest(torrent) {
  const data = {};

  for (let tracker of torrent.trackers) {
    const response = await request(
      `${tracker}?info_hash=${torrent.topic.hash}&peer_id=${torrent.status.peer_id}&port=${port}&uploaded=${torrent.status.uploaded}&downloaded=${torrent.status.downloaded}&left=${torrent.status.left}&event=${torrent.status.event}`,
    );

    console.log(response);
  }

  return data;
}

module.exports = {
  stringify,
  normalizeTorrent,
  normalizeMagnet,
  trackerRequest,
};
