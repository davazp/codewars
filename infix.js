var calc = function (expression) {
  var tokens = expression.replace(/[-()+*/]/g, ' $& ')
                         .split(/\s+/)
                         .filter(function(x){ return x!==''; });

  function term () {
    var tok = tokens.shift();
    if (tok.match(/^[0-9.]+$/))
      return +tok;
    if (tok === '-')
      return -term();
    if (tok === '('){
      var value = sum();
      tokens.shift();  // )
      return value;
    }
    throw new Error('unknown term ' + tok);
  }

  function defineRule(operators, subrule){
    return function () {
      var result = subrule();
      while (tokens[0] in operators){
        var fn = operators[tokens.shift()];      
        result = fn(result, subrule());
      }
      return result;
    };
  }

  var product = defineRule({
    '*': function(x,y){ return x*y; },
    '/': function(x,y){ return x/y; }
  }, term);

  var sum = defineRule({
    '+': function(x,y){ return x+y; },
    '-': function(x,y){ return x-y; }
  }, product);

  return sum();
};
