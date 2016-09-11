
/*
*@description 操作面板
*/

var zoom = require('./../zoom');

var mapControl = function (state, action) {
    state = state || {};
    switch (action.type) {
        case "2_mousedown":
            state.startX = action.data.ox;
            state.startY = action.data.oy;
            state.mx = 0;
            state.my = 0;
            state.isPan = 1;
            return state;
        case "2_mousemove":
            if(state.isPan){
                state.mx = state.startX - action.data.ox;
                state.my = state.startY - action.data.oy;
                state.startX = action.data.ox;
                state.startY = action.data.oy;   
                zoom.move(state.mx, state.my);
                state.isUpdate = true;
            }
            return state;
        case "2_mouseup":
            state.isPan = 0;
            return state;
        case "zoom_in":
            zoom.zoomIn();
            state.isUpdate = true;
            return state;
        case "zoom_out":
            zoom.zoomOut();
            state.isUpdate = true;
            return state;
        default:
            return state;
    }
};


module.exports = mapControl;

