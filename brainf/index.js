module.exports = function run(program, input) {
  let output = '';
  const memory = {};
  let memoryPointer = 0;
  let programPointer = 0;
  let inputPointer = 0;
  let parenCounter;

  while (program[programPointer]) {
    const code = program[programPointer];
    if (code == '>') memoryPointer++;
    if (code == '<') memoryPointer--;
    if (code == '+') memory[memoryPointer] = (~~memory[memoryPointer] + 1) % 256;
    if (code == '-') memory[memoryPointer] = (~~memory[memoryPointer] + 255) % 256;
    if (code == '.') output += String.fromCharCode(~~memory[memoryPointer]);
    if (code == ',') memory[memoryPointer] = input.charCodeAt(inputPointer++);
    if (code == '[' && !memory[memoryPointer]) {
      parenCounter = 0;
      do {
        if (program[++programPointer] == '[') parenCounter++;
        else if (program[programPointer] == ']') parenCounter--;
      } while (parenCounter);
    }
    if (code == ']' && memory[memoryPointer]) {
      parenCounter = 1;
      while (parenCounter) {
        if (program[--programPointer] == ']') parenCounter++;
        else if (program[programPointer] == '[') parenCounter--;
      }
    }
    programPointer++;
  }
  return output;
};
