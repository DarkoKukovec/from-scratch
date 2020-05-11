const { stringifyBits, numberToBits } = require('../helpers');

function getTreeValue(symbol) {
  const value = [];
  let position = symbol;

  while (position.parent) {
    value.unshift(Boolean(position.parent.children.indexOf(position)));
    position = position.parent;
  }

  return value;
}

function getNormalizedTree(mapping, alphabet) {
  const maxBits = Math.max(...mapping);
  const hash = {};

  // Step 1 - Count the number of codes for each code length
  const blCount = Array(maxBits + 1).fill(0);
  mapping.forEach((value) => {
    value && blCount[value]++;
  });

  // Step 2 - Find the numerical value of the smallest code for each code length
  let code = 0;
  const nextCode = blCount.map((_, bits) => {
    return (code = code + (blCount[bits - 1] || 0)) << 1;
  });

  // Step 3 - Assign numerical values to all codes
  alphabet.forEach((key, index) => {
    const len = mapping[index];
    if (len) {
      hash[key] = numberToBits(nextCode[len], len);
      nextCode[len]++;
    }
  });

  const map = {};
  Object.keys(hash).forEach((key) => {
    map[stringifyBits(hash[key])] = key;
  });

  return { hash, map };
}

function encode(input, deflate) {
  const symbols = {};
  input.forEach((item) => {
    symbols[item] = symbols[item] || 0;
    symbols[item]++;
  });

  const tree = Object.keys(symbols).map((symbol) => ({
    symbol,
    weight: symbols[symbol],
    parent: null,
    children: null,
  }));

  for (;;) {
    const roots = tree.filter((item) => item.parent === null).sort((a, b) => a.weight - b.weight);
    if (roots.length === 1) {
      break;
    }
    const [a, b] = roots;
    const newNode = {
      symbol: `${a.symbol}${b.symbol}`,
      weight: a.weight + b.weight,
      parent: null,
      children: [a, b],
    };
    tree.push(newNode);
    a.parent = newNode;
    b.parent = newNode;
  }

  const mapping = {};
  tree
    .filter((item) => item.children === null)
    .forEach((item) => {
      mapping[item.symbol] = getTreeValue(item);
    });

  const dictionary = {};
  if (deflate) {
    const alphabet = Object.keys(mapping).sort();
    const res = getNormalizedTree(
      alphabet.map((key) => mapping[key].length),
      alphabet.slice().sort(),
    );
    Object.assign(dictionary, res.hash);
  }

  const output = [];
  input.forEach((item) => {
    output.push(...(deflate ? dictionary : mapping)[item]);
  });

  return { output, mapping: deflate ? dictionary : mapping };
}

function decode(input, mapping, alphabet) {
  let data = stringifyBits(input);
  const hash = {};

  const tree = alphabet ? getNormalizedTree(mapping, alphabet.slice().sort()).hash : mapping;
  Object.keys(tree).forEach((key) => {
    hash[stringifyBits(tree[key])] = key;
  });

  const keys = Object.keys(hash);
  console.log(keys.length, hash);
  const output = [];
  for (;;) {
    const next = keys.find((key) => data.startsWith(key));
    if (!next) {
      break;
    }
    output.push(next);
    data = data.slice(next.length);
  }

  return output.map((item) => hash[item]);
}

module.exports = { encode, decode, getHuffmanTree: getNormalizedTree };
