const MAX_BITS = 8; // TODO: Find the actual value

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
  const keys = alphabet.slice().sort();
  const hash = {};

  // Step 1 - Count the number of codes for each code length
  const blCount = {};
  mapping.forEach((value) => {
    blCount[value] = blCount[value] || 0;
    blCount[value]++;
  });

  // Step 2 - Find the numerical value of the smallest code for each code length
  let code = 0;
  blCount[0] = 0;
  const nextCode = {};
  for (let bits = 1; bits <= MAX_BITS; bits++) {
    code = (code + blCount[bits - 1]) << 1;
    nextCode[bits] = code;
  }

  // Step 3 - Assign numerical values to all codes
  for (let n = 0; n < keys.length; n++) {
    const len = mapping[n];
    if (len !== 0) {
      hash[keys[n]] = Array(mapping[n])
        .fill(0)
        .map((_, index) => Boolean(nextCode[len] & (2 ** index)))
        .reverse();
      nextCode[len]++;
    }
  }

  return { keys, hash };
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
      alphabet,
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
  let data = input.map((item) => (item ? 1 : 0)).join('');
  const hash = {};

  if (alphabet) {
    const res = getNormalizedTree(mapping, alphabet);
    res.keys.forEach((key) => {
      hash[res.hash[key].map((item) => (item ? 1 : 0)).join('')] = key;
    });
  } else {
    Object.keys(mapping).forEach((key) => {
      hash[mapping[key].map((item) => (item ? 1 : 0)).join('')] = key;
    });
  }

  const keys = Object.keys(hash);
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

module.exports = { encode, decode };
