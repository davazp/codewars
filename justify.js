/**
 * @param {String} str - inital string
 * @param {Number} len - line length
 */
var justify = function(str, len) {
  var words = str.split(' ');
  var output = [];
  while (words.length){
    // Collect as many words as possible for the current line
    var lineWords = [];      
    while (words.length>0 && (lineWords+','+words[0]).length <= len)
      lineWords.push(words.shift());

    if (words.length){  // No last line, so justify it
     // Compute the holes between the words
     var spaces = len - (''+lineWords).length;
     for (var i=0; i<spaces; i++)
       lineWords[i % (lineWords.length-1)] += ' ';
    }

    // Build the line
    output.push(lineWords.join(' '));
  }

  return output.join('\n');
};
