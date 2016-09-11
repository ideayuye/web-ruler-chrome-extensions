
var interpreter = {};

//返回action.type
interpreter.parse = function(state,action,mouseType,map){
    var selectPath = map.getSelectedPath();
    switch (mouseType) {
        case 'mousedown':
            //如果有对象被选中 切换到编辑状态
            if(selectPath){  
                if(selectPath.lightEar){
                    return "e_m_node_start";
                }
               return "e_move_start";
            }
            // 绘制标注状态
            if(action == 1){
                return '1_mousedown';
            }
            if(action == 2){
                return "2_mousedown";
            }
        case 'mousemove':
            var edit = state.edit;
            if(selectPath && selectPath.lightEar && edit.isNodeMove){
                return "e_m_node_moving";
            }
            if(selectPath && edit.isMove){  
               return "e_move_moving";
            }
            // 画标注
            var draw = state.draw;
            if(draw.curPath){
                return '1_mousemove';
            }
            // 平移面板
            var control = state.control;
            if(control.isPan){
                return "2_mousemove";
            }
            return "3_mousemove";
        case 'mouseup':
            var edit = state.edit;
            if(selectPath && selectPath.lightEar && edit.isNodeMove){
                return "e_m_node_end";
            }
            if(selectPath && edit.isMove){  
               return "e_move_end";
            }
             if(action == 1){
                return '1_mouseup';
            }
            if(action == 2){
                return "2_mouseup";
            }
    }
}

module.exports = interpreter;

