
/*
*@description 处理用户输入的数据
*/

var LengthMark = require('./../lengthMark.js');
var bg = require('./../background.js');
var map = require('./../map.js');

var process = function (state, action) {
    state = state || { };
    switch (action.type) {
        case "1_mousedown":
            if (!state.curPath) {
                state.curPath = new LengthMark(map.viewCtx);
                map.tempLayer.addPath(state.curPath);
                state.curPath.process(action.data);
                state.isUpdate = true;
            }
            return state;
        case "1_mousemove":
            if (state.curPath) {
                state.curPath.process(action.data);
                state.isUpdate = true;
            }
            return state;
        case "1_mouseup":
            if (state.curPath) {
                state.curPath.process(action.data);
                if(state.curPath.length()<1){
                    var id = state.curPath.id;
                    map.tempLayer.remove(id);
                    state.curPath = null;
                }else{
                    if (state.curPath.isEnd()) {
                        var id = state.curPath.id;
                        map.tempLayer.remove(id);
                        map.curLayer.addPath(state.curPath);
                        state.curPath = null;
                    }
                    state.isUpdate = true;
                }
            }
            return state;
        case "setbackground":
            if(!map.bg){
                map.bg = bg;
                map.bg.init(map.cacheCtx);
            }
            map.bg.setBG(action.screenShot);
            state.isUpdate = true;
            return state;
        default:
            return state;
    }
};


module.exports = process;

