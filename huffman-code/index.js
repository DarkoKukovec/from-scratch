function getTreeValue(symbol) {
  const value = [];
  let position = symbol;

  while (position.parent) {
    value.unshift(Boolean(position.parent.children.indexOf(position)));
    position = position.parent;
  }

  return value;
}

function encode(input) {
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

  const output = [];
  input.forEach((item) => {
    output.push(...mapping[item]);
  });

  return { output, mapping };
}
function decode(input, mapping, length) {
  let data = input.map((item) => (item ? 1 : 0)).join('');
  const hash = {};
  Object.keys(mapping).forEach((key) => {
    hash[mapping[key].map((item) => (item ? 1 : 0)).join('')] = key;
  });
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

  return output.slice(0, length).map((item) => hash[item]);
}

module.exports = { encode, decode };
