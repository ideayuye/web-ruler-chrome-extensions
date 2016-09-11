
var $M = require('./sylvester.js').$M;

var A = $M([
    [1,2],
    [2,4]
]);

var B = $M([
    [3,10,2],
    [3,4,2]
]);

var C = A.x(B);

console.log(C);

console.log(C.e(1,1),C.e(2,3));

