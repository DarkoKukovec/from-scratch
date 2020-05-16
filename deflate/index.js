const {
  extractBits,
  byteArrayToBits,
  bitsToNumber,
  stringifyBits,
  byteToBit,
} = require('../helpers');
const { getHuffmanTree } = require('../huffman-code');

function prepareMap(map) {
  const keys = Object.keys(map).sort().reverse();
  return {
    map,
    keys,
    maxSize: Math.max(...keys.map((key) => key.length)),
  };
}

function findCode(inputBits, { map, keys, maxSize }) {
  const input = stringifyBits(inputBits.slice(0, maxSize));
  const key = keys.find((item) => input.startsWith(item));

  if (!key) {
    console.log('not found', input, inputBits.length, maxSize);
    inputBits.splice(0, 1);
    return 0;
  }

  inputBits.splice(0, key.length);
  return map[key];
}

function encode(input) {
  throw new Error('Not yet implemented');
}

function decode(input) {
  const data = Array.from(input);
  const cmf = data.shift();
  const flg = data.shift();
  const fdict = extractBits(flg, 5, 1);
  data.splice(0, 4);
  const dictid = fdict ? data.splice(0, 4) : null; // TODO: What?
  const adler32 = data.splice(-4, 4); // TODO: Checksum

  const compressionInfo = extractBits(cmf, 4, 4);
  const compressionMethod = extractBits(cmf, 0, 4);

  if (compressionMethod !== 8) {
    throw new Error('Only compression method 8 (deflate) is supported');
  } else if (compressionInfo > 7) {
    throw new Error("Compression info size can't be bigger than 7 (by spec)");
  }

  const windowSize = 2 ** (compressionInfo + 8); // TODO: What?

  // const fcheck = extractBits(flg, 0, 5);
  if ((cmf * 256 + flg) % 31 !== 0) {
    throw new Error("Checksum doesn't match");
  }

  // Not needed for decompression
  const flevel = extractBits(flg, 6, 2);

  console.log('init', dictid, windowSize, fdict, flevel, adler32, byteToBit(data[0]));

  if (dictid) {
    // TODO: Extract/generate the dictionary?
  }

  const inputBits = byteArrayToBits(data);
  const inputSize = inputBits.length;
  let outputBits = [];

  let bfinal = false;
  while (!bfinal && inputBits.length) {
    bfinal = inputBits.shift();
    const btype = bitsToNumber(inputBits.splice(0, 2));

    if (btype === 3) {
      throw new Error('btype 11 not allowed');
    }

    if (btype === 0) {
      const skipBits = (((8 - inputSize + inputBits.length) % 8) + 8) % 8;
      inputBits.splice(0, skipBits);
      const len = bitsToNumber(inputBits.splice(0, 16));
      const nlen = bitsToNumber(inputBits.splice(0, 16));
      // if (len !== ~nlen) {
      //   throw new Error(`Lengths don't match ${len}, ${nlen}, ${~nlen}`);
      // }
      outputBits.push(...inputBits.splice(0, len * 8));
      continue;
    }

    const mapping = Array(288).fill(0);
    const alphabet = Array(288)
      .fill(0)
      .map((_, index) => index);
    let hash = {};

    if (btype === 1) {
      mapping.fill(8, 0, 144).fill(9, 144, 256).fill(7, 256, 280).fill(8, 280, 288);
      const output = getHuffmanTree(mapping, alphabet);
      hash = output.map;
    } else if (btype === 2) {
      const hlit = bitsToNumber(inputBits.splice(0, 5)) + 257;
      const hdist = bitsToNumber(inputBits.splice(0, 5)) + 1; // TODO: What?
      const hclen = bitsToNumber(inputBits.splice(0, 4)) + 4 && 19; // TODO: Why 0?

      const codes = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      const codeLengths = [];
      const lengths = inputBits.splice(0, hclen * 3);
      while (lengths.length) {
        codeLengths.push(bitsToNumber(lengths.splice(0, 3)));
      }
      const huffRes = getHuffmanTree(codeLengths, codes);

      // console.log(huffRes, hclen * 3, lengths);
      // inputBits.lengths = 0;
      // break;

      let pos = 0;
      const finder = prepareMap(huffRes.map);
      while (pos < hlit) {
        const key = ~~findCode(inputBits, finder);
        if (key === 16) {
          const prev = mapping[pos - 1] || 0;
          const count = bitsToNumber(inputBits.splice(0, 2)) + 3;
          mapping.fill(prev, pos, pos + count);
          pos += count;
        } else if (key === 17) {
          const count = bitsToNumber(inputBits.splice(0, 3)) + 3;
          mapping.fill(0, pos, pos + count);
          pos += count;
        } else if (key === 18) {
          const count = bitsToNumber(inputBits.splice(0, 7)) + 11;
          mapping.fill(0, pos, pos + count);
          pos += count;
        } else {
          mapping[pos] = key;
          pos++;
        }
      }
      const output = getHuffmanTree(mapping, alphabet);
      hash = output.map;
    }

    let code;
    const finder = prepareMap(hash);

    while (code !== 256 && inputBits.length) {
      code = findCode(inputBits, finder);
      let length;
      let distance;
      if (code < 256) {
        outputBits.push(...byteToBit(code));
        // console.log('val', bitsToNumber(byteToBit(code)));
        continue;
      } else if (code === 256) {
        break;
      } else if (code === 285) {
        length = 258;
      } else {
        const lc = Math.ceil(Math.max(0, code - 264) / 4);
        length = (code - 257 - lc * 4) * 2 ** lc + 3 + bitsToNumber(inputBits.splice(0, lc));
      }

      //

      const dist = bitsToNumber(inputBits.splice(0, 5));
      const dc = Math.ceil(Math.max(0, dist - 3) / 2);
      distance = (dist - dc) * 2 ** dc + 1 + bitsToNumber(inputBits.splice(0, dc));

      for (let index = 0; index < length; index++) {
        outputBits.push(outputBits[outputBits.lengths - distance + index]);
      }
    }
  }

  return outputBits;
}

module.exports = { encode, decode };
