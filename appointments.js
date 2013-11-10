/*
  Description:

  The businessmen of you will know, often it's not easy to find an appointment. In this kata we want to find such an appointment automatically. You will be given the calendars of our businessmen and a duration for the meeting. Your task is to find the earliest time, when every businessman is free for at least that duration.

  Example Schedule:

Person | Meetings
-------+------------------------------
     A | 09:00 - 11:30, 13:30 - 16:00, 16:00 - 17:30, 17:45 - 19:00
     B | 09:15 - 12:00, 14:00 - 16:30, 17:00 - 17:30
     C | 11:30 - 12:15, 15:00 - 16:30, 17:45 - 19:00

Rules:

All times in the calendars will be given in 24h format "hh:mm", the result must also be in that format.
A meeting is represented by its start time (inclusively) and end time (exclusively) -> if a meeting takes place from 09:00 - 11:00, the next possible start time would be 11:00
The businessmen work from 09:00 (inclusively) - 19:00 (exclusively), the appointment must start and end within that range
If the meeting does not fit into the schedules, return null as result
The duration of the meeting will be provided as integer in minutes
Following these rules and looking at the example above the earliest time for a 60 minutes meeting would be 12:15

Data Format:

The schedule will be provided as 3-dimensional array. The schedule above would be encoded this way:

[
  [['09:00', '11:30'], ['13:30', '16:00'], ['16:00', '17:30'], ['17:45', '19:00']],
  [['09:15', '12:00'], ['14:00', '16:30'], ['17:00', '17:30']],
  [['11:30', '12:15'], ['15:00', '16:30'], ['17:45', '19:00']]
]
*/

function getStartTime(schedules, duration){
  // Initialize common schedule to free. An element per minute of the
  // working time.
  var common = Array(10*60);
  for (var i=0; i<common.length; i++)
    common[i] = 0;

  function offsetTime (time) {
    var parts = time.split(':');
    return ((parts[0]-9)*60|0) + (parts[1]|0);
  }

  // Fill the busy times in the common schedue
  for (var i=0; i<schedules.length; i++){
    var schedule = schedules[i];
    for (var j=0; j<schedule.length; j++){
      var interval = schedule[j];     
      for (var k=offsetTime(interval[0]); k<offsetTime(interval[1]); k++)
        common[k] = 1;
    }
  }

  // Find the first available interval in the common schedule and
  // format the result.
  function pad2(n){
    return n>10? n: '0' + n;
  }
  var start = common.join('').indexOf(  Array(duration+1).join('0') );
  return start<0? null: pad2((start/60 |0)+9) + ':' + pad2(start%60);
}
