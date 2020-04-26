const { byteArrayToNumber, byteArrayToString } = require('../helpers');

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
    if (output.info.bitDepth !== 8) {
      throw new Error('Only 8 bit pngs are supported');
    }
  },
  PLTE(payload, output) {
    const data = Array.from(payload);
    output.palette = [];
    while (data.length) {
      output.palette.push([
        byteArrayToNumber(data.splice(0, 1)),
        byteArrayToNumber(data.splice(0, 1)),
        byteArrayToNumber(data.splice(0, 1)),
      ]);
    }
  },
  IDAT(payload, output) {
    const data = Array.from(payload);
    const type = output.info.colorType;
    output.pixels = output.pixels || [];
    while (data.length) {
      if (type === 0) {
        const color = byteArrayToNumber(data.splice(0, 1));
        output.pixels.push([color, color, color]);
      } else if (type === 2) {
        output.pixels.push([
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
        ]);
      } else if (type === 3) {
        const index = byteArrayToNumber(data.splice(0, 1));
        output.pixels.push(output.palette[index]);
      } else if (type === 4) {
        const color = byteArrayToNumber(data.splice(0, 1));
        output.pixels.push([color, color, color, byteArrayToNumber(data.splice(0, 1))]);
      } else if (type === 6) {
        output.pixels.push([
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
          byteArrayToNumber(data.splice(0, 1)),
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

  chunks
    .filter((chunk) => chunk.name in cmds)
    .map((chunk) => {
      cmds[chunk.name](chunk.data, output);
    });

  // return output;
  return { ...output, chunks: output.chunks.map((c) => c.name) };
};
