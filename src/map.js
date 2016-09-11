
var Layer = require('./Layer.js');

var map = {
    tempLayer: new Layer(),
    curLayer: new Layer(),
    cacheCtx: null,
    viewCtx:null,
    bg: null
}

map.getSelectedPath = function () {
    return this.curLayer.selectedPath;
}

map.clear = function(){
    this.curLayer.clear();
}

module.exports = map;

