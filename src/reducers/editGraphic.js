
/*
*@description 编辑图形
*/
var map = require('./../map');

var editGraphics = function (state, action) {
    state = state || {};
    switch (action.type) {
        case "3_mousemove":
            //遍历图形 hover中的图形 设置高亮状态
            var dt = action.data;
            map.curLayer.hitTest(dt);
            return state;
        case "e_move_start":
            state.lastX = action.data.x;
            state.lastY = action.data.y;
            state.mx = 0;
            state.my = 0;
            state.isMove = 1;
            var path = map.getSelectedPath();
            path.isEdit = 1;
            return state;
        case "e_move_moving":
            if(state.isMove){
                var mx = action.data.x - state.lastX;
                var my = action.data.y - state.lastY;
                state.lastX = action.data.x;
                state.lastY = action.data.y; 
                var path = map.getSelectedPath();
                path.move(mx,my);
            }
            return state;
        case "e_move_end":
            state.isMove  = 0 ;
            var path = map.getSelectedPath();
            path.isEdit = 0 ;
            return state;
        case "e_m_node_start":
            state.lastX = action.data.x;
            state.lastY = action.data.y;
            state.mx = 0;
            state.my = 0;
            state.isNodeMove = 1;
            var path = map.getSelectedPath();
            path.freezNodeOrder();
            path.isEdit = 1;
            return state;
        case "e_m_node_moving":
            if(state.isNodeMove){
                var mx = action.data.x - state.lastX;
                var my = action.data.y - state.lastY;
                state.lastX = action.data.x;
                state.lastY = action.data.y; 
                var path = map.getSelectedPath();
                path.moveNode(mx,my);
            }
            return state;
        case "e_m_node_end":
            state.isNodeMove  = 0 ;
            var path = map.getSelectedPath();
            path.isEdit = 0;
            return state;
        default:
            return state;
    }
};


module.exports = editGraphics;


