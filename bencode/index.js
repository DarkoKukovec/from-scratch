function decode(buffer) {
  const bin = buffer instanceof Buffer ? Array.from(buffer) : buffer;
  const next = String.fromCharCode(bin[0]);

  if (next === 'e') {
    // End of the list/dictionary
    bin.splice(0, 1);
    return null;
  } else if (next === 'i') {
    // Number
    const endIndex = bin.indexOf('e'.charCodeAt(0));
    const section = bin.splice(0, endIndex + 1);
    return parseInt(String.fromCharCode(...section.slice(1, -1)), 10);
  } else if (next === 'l') {
    // List
    bin.splice(0, 1);
    const data = [];
    for (;;) {
      const item = decode(bin);
      if (item === null) {
        return data;
      }
      data.push(item);
    }
  } else if (next === 'd') {
    // Dictionary
    bin.splice(0, 1);
    const data = {};

    for (;;) {
      const key = decode(bin);
      if (key) {
        data[String.fromCharCode(...key)] = decode(bin);
      } else {
        return data;
      }
    }
  } else if (!isNaN(parseInt(next, 10))) {
    // Byte string
    const separator = bin.indexOf(':'.charCodeAt(0));
    const length = parseInt(String.fromCharCode(...bin.splice(0, separator + 1)), 10);
    return bin.splice(0, length);
  }
}

module.exports = {
  encode(data) {},

  decode,
};
