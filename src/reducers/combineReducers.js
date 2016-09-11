
var combineReducers = require('redux').combineReducers;
var process = require('./process');
var control = require('./mapControl');
var edit = require('./editGraphic');

var reducers = combineReducers({
    draw:process,
    control:control,
    edit:edit
});

module.exports = reducers;
