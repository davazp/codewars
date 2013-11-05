function formatDuration (seconds) {
  var components = [  "year", "day", "hour", "minute", "second"];
  var times      = [31536000, 86400,   3600,       60,        1];

  function formatComponents (x){
    var comma = x.slice(0,-2).join(', ');
    return (comma && comma+', ') + x.slice(-2).join(' and ');
  }

  if (seconds == 0) return 'now';
  return formatComponents(
    times.map(function(secondsByUnit,i){
      var value = (seconds / secondsByUnit) | 0;
      seconds %= secondsByUnit;
      return value==0? '': value + ' ' + components[i] + (value>1? 's':'');
    }).filter(function(x) { return x; }));
}
