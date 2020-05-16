const { byteArrayToNumber, byteArrayToString, bitsToByteArray } = require('../helpers');

const { decode } = require('../deflate');

const prefix = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function isValidChunk(data, crc) {
  // TODO
  return true;
}

const cmds = {
  IHDR(payload, output) {
    const data = Array.from(payload);
    output.info = output.info || {};
    output.info.width = byteArrayToNumber(data.splice(0, 4));
    output.info.height = byteArrayToNumber(data.splice(0, 4));
    output.info.bitDepth = byteArrayToNumber(data.splice(0, 1));
    output.info.colorType = byteArrayToNumber(data.splice(0, 1));
    output.info.compressionMethod = byteArrayToNumber(data.splice(0, 1));
    output.info.filterMethod = byteArrayToNumber(data.splice(0, 1));
    output.info.interlaceMethod = byteArrayToNumber(data.splice(0, 1));
    console.log(output.info);
  },
  PLTE(payload, output) {
    const data = Array.from(payload);
    const maxCount = 2 ** output.info.bitDepth;
    output.palette = [];
    let pos = 0;
    while (data.length) {
      if (output.palette.length > maxCount) {
        output.palette[pos].push(byteArrayToNumber(data.splice(0, 1)));
        pos++;
      } else {
        output.palette.push([
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
        ]);
      }
    }
  },
  tRNS(payload, output) {
    const data = Array.from(payload);
    let pos = 0;
    // TODO: Support for other colorTypes
    while (data.length) {
      output.palette[pos].push(byteArrayToNumber(data.splice(0, 1)));
      pos++;
    }
  },
  IDAT(payload, output) {
    console.log('idat size', payload.length * 8);

    const decodedData = bitsToByteArray(decode(payload.slice(0)), output.info.bitDepth);
    console.log('data', (payload.length * 8) / output.info.bitDepth, '->', decodedData.length);

    let count = 3;
    if (output.info.colorType === 3) {
      count = 1;
    } else if (output.info.colorType === 4) {
      count = 2;
    } else if (output.info.colorType === 6) {
      count = 4;
    }
    console.log('expected', count * output.info.width * output.info.height);

    output.pixels = output.pixels || [];
    while (decodedData.length) {
      if (output.info.colorType === 0) {
        const color = decodedData.shift();
        output.pixels.push([color, color, color]);
      } else if (output.info.colorType === 2) {
        output.pixels.push([decodedData.shift(), decodedData.shift(), decodedData.shift()]);
      } else if (output.info.colorType === 3) {
        const index = decodedData.shift();
        if (output.palette[index]) {
          output.pixels.push(output.palette[index]);
        } else {
          console.log('missing palette item', index);
        }
      } else if (output.info.colorType === 4) {
        const color = decodedData.shift();
        const alpha = decodedData.shift();
        output.pixels.push([color, color, color, alpha]);
      } else if (output.info.colorType === 6) {
        output.pixels.push([
          decodedData.shift(),
          decodedData.shift(),
          decodedData.shift(),
          decodedData.shift(),
        ]);
      }
    }
  },
  // eXIf
  // tIME
};

module.exports = function (image) {
  const data = Array.from(image);
  const dataPrefix = data.splice(0, prefix.length);
  const output = {};
  if (dataPrefix.some((byte, index) => byte !== prefix[index])) {
    throw new Error('Not a valid png');
  }

  const chunks = [];
  while (data.length) {
    const size = byteArrayToNumber(data.splice(0, 4));
    const name = byteArrayToString(data.splice(0, 4));
    const chunkData = data.splice(0, size);
    const crc = data.splice(0, 4);
    chunks.push({
      size,
      name,
      data: chunkData,
      crc,
      valid: isValidChunk(chunkData, crc),
    });
  }
  output.chunks = chunks;

  console.log(
    'all chunks',
    chunks.map(({ name }) => name),
  );

  chunks
    .filter((chunk) => chunk.name in cmds)
    .map((chunk) => {
      console.log('chunk', chunk.name);
      cmds[chunk.name](chunk.data, output);
    });

  // return output;
  return { ...output, chunks: output.chunks.map((c) => c.name) };
};
