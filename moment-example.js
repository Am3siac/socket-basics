var moment = require('moment');

var now = moment();

// console.log(now.format());
console.log(now.format('X'));
console.log(now.format('x'));

var timestamp = 1466157852000;
var timestampMoment = moment.utc(timestamp);

console.log(timestampMoment.format());
console.log(timestampMoment.format('h:mm a'));
console.log(timestampMoment.local().format('h:mm a'));

// now.subtract(1, 'month');

// console.log(now.format());
// console.log(now.format('MMM Do YYYY, h:mma')); // Oct 5th 2015, 6:45pm