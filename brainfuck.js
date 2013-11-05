function brainLuck(code, input){
  var mem = []; // memory
  var cs = [];  // control stack
  var ip=0;     // instruction pointer
  var mp=0;     // memory pointer
  var output = [];

  var opcodes = {
    // Input/output
    '.': function(){
      output.push(String.fromCharCode(mem[mp] | 0));
    },
    ',': function(){
      mem[mp] = input[0].charCodeAt(0);
      input = input.slice(1);
    },
    // Memory
    '+': function(){ mem[mp] = ((mem[mp]|0) + 1) & 255; },
    '-': function(){ mem[mp] = ((mem[mp]|0) - 1) & 255; },
    '>': function(){ mp++; },
    '<': function(){ mp--; },
    // Control-flow
    '[': function(){
      if (!mem[mp]){
        var balance = 1;
        while (balance != 0) {
          switch(code[ip++]){
          case '[': balance++; break;
          case ']': balance--; break;
          }
        }
      } else {
        cs.push(ip-1);
      }
    },
    ']': function(){
      ip = cs.pop();
      if (!ip) new Error('Badly balanced bracket.');
    }
  };

  // Execution loop
  while (ip < code.length){
    var fn = opcodes[code[ip++]] || function(){}
    fn();
  }

  return output.join('');
}
