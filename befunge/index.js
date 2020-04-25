module.exports = function run(program) {
  let output = '';
  const stack = [];
  const position = { x: 0, y: 0 };
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  let direction = directions[0];

  const commands = {
    '0': () => stack.push(0),
    '1': () => stack.push(1),
    '2': () => stack.push(2),
    '3': () => stack.push(3),
    '4': () => stack.push(4),
    '5': () => stack.push(5),
    '6': () => stack.push(6),
    '7': () => stack.push(7),
    '8': () => stack.push(8),
    '9': () => stack.push(9),
    '+': () => stack.push(stack.pop() + stack.pop()),
    '-': () => stack.push(-stack.pop() + stack.pop()),
    '*': () => stack.push(stack.pop() * stack.pop()),
    '/': () => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(a ? Math.floor(b / a) : 0);
    },
    '%': () => {
      const a = stack.pop();
      const b = stack.pop();
      stack.push(a ? b % a : 0);
    },
    '!': () => stack.push(stack.pop() ? 0 : 1),
    '`': () => stack.push(stack.pop() < stack.pop() ? 1 : 0),
    '>': () => (direction = directions[0]),
    '<': () => (direction = directions[1]),
    v: () => (direction = directions[2]),
    '^': () => (direction = directions[3]),
    '?': () => (direction = directions[Math.floor(Math.random() * 4)]),
    _: () => (direction = { x: stack.pop() ? -1 : 1, y: 0 }),
    '|': () => (direction = { x: 0, y: stack.pop() ? -1 : 1 }),
    '"': () => {
      let cmd;
      while ((cmd = move()) !== '"') {
        stack.push(cmd.charCodeAt(0));
      }
    },
    ':': () => stack.push(stack[stack.length - 1]),
    '\\': () => stack.push(...stack.slice(-2).replace()),
    $: () => stack.pop(),
    '.': () => (output += stack.pop().toString()),
    ',': () => (output += String.fromCharCode(stack.pop())),
    '#': () => move(),
    p: function () {
      const x = stack.pop();
      const y = stack.pop();
      const v = stack.pop();
      while (program[y] === undefined) program.push('');
      program[y][x] = String.fromCharCode(v);
    },
    g: function () {
      const x = stack.pop();
      const y = stack.pop();
      while (program[y] === undefined) program.push('');
      if (!program[y][x]) program[y] += '\0';
      stack.push(program[y].charCodeAt(x));
    },
  };

  program = program.split('\n');
  let cmd = program[position.y][position.x];
  while (cmd !== '@') {
    if (commands[cmd]) {
      commands[cmd]();
    }
    cmd = move();
  }

  function move() {
    position.y += direction.y;
    position.x += direction.x;
    do {
      if (position.y < 0) {
        position.y = program.length - 1;
        position.x--;
      } else if (position.y >= program.length) {
        position.y = 0;
        position.x++;
      }
      if (position.x < 0) {
        position.y--;
        console.log('pos', position);
        position.x = program[position.y].length - 1;
      } else if (position.x >= program[position.y].length) {
        position.y++;
        position.x = 0;
      }
    } while (program[position.y] === undefined || program[position.y][position.x] === undefined);
    return program[position.y][position.x];
  }

  return output;
};
