function Compiler () {};

Compiler.prototype.compile = function (program) {
  return this.pass3(this.pass2(this.pass1(program)));
};

Compiler.prototype.tokenize = function (program) {
  // Turn a program string into an array of tokens.  Each token
  // is either '[', ']', '(', ')', '+', '-', '*', '/', a variable
  // name or a number (as a string)
  var regex = /\s*([-+*/\(\)\[\]]|[A-Za-z]+|[0-9]+)\s*/g;
  return program.replace(regex, ":$1").substring(1).split(':').map( function (tok) {
    return isNaN(tok) ? tok : tok|0;
  });
};


// Parser
Compiler.prototype.pass1 = function (program) {
  var tokens = this.tokenize(program);
  var vars = [];
  var tok;
  
  // Function arguments
  tokens.shift();  '['
  while ((tok = tokens.shift()) != ']'){
    vars.push(tok);
  }

  // We implement this equivalent grammar for the function body
  // instead:
  // 
  // expr   ::= term  (("+"|"-") term )*
  // term   ::= factor (("*"|"/") factor )*
  // factor ::= integer | "(" expr ")"

  function rule(ops, subrule) {
    return function () {
      var a = subrule();
      while (true) {
        var tok = tokens.shift();
        if (ops.indexOf(tok) >= 0)
          a = {op: tok, a: a, b: subrule()};
        else {
          tokens.unshift(tok);
          return a;
        }
      }
    };
  }
  
  function factor () {
    var tok = tokens.shift();
    if (tok == '('){
      var ast = expression()
      tokens.shift(); // ')'
      return ast;
    } else if (isFinite(parseInt(tok))) {
      return {op: 'imm', n: parseInt(tok)};
    } else {
      return {op: 'arg', n: vars.indexOf(tok)};
    }
  }
    
  var term       = rule(['*','/'], factor);
  var expression = rule(['+','-'], term);

  return expression();
};


// Optimizations
Compiler.prototype.pass2 = function (ast) {
  function immediatep (x) {
    return x.op == 'imm'
  }

  if (ast.op == 'imm' || ast.op == 'arg')
    return ast;

  ast.a = this.pass2(ast.a);
  ast.b = this.pass2(ast.b);

  if (immediatep(ast.a) && immediatep(ast.b)){
    switch (ast.op) {
    case '+': return {op: 'imm', n: ast.a.n + ast.b.n};
    case '-': return {op: 'imm', n: ast.a.n - ast.b.n};
    case '*': return {op: 'imm', n: ast.a.n * ast.b.n};
    case '/': return {op: 'imm', n: ast.a.n / ast.b.n};
    }
  } else
    return ast;
};


// Code generation
Compiler.prototype.pass3 = function (ast) {
  if (ast.op == 'imm') return ['IM ' + ast.n];
  if (ast.op == 'arg') return ['AR ' + ast.n];
  
  var result = [];
  result = result.concat(this.pass3(ast.a));
  result.push('PU');
  result = result.concat(this.pass3(ast.b));
  result.push('SW');
  result.push('PO');
  
  switch (ast.op) {  
  case '+': result.push('AD'); break;
  case '-': result.push('SU'); break;
  case '*': result.push('MU'); break;
  case '/': result.push('DI'); break;
  }
  return result;
}
