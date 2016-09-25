
/*
*@description 图层
**/

var zoom = require('./zoom.js');

var Layer = function(){
    this.paths={};
    this.selectedPath = null;
    this.addPath=function(p){
        this.paths[p.id] = p;
    };
    this.remove=function(id){
        delete this.paths[id];
    };
};

Layer.prototype.clear = function(){
    this.paths = {};
}

Layer.prototype.draw=function(isRetina) {
    for (var p in this.paths) {
        //计算图形是否展示
        //坐标转换到显示区坐标 
        var path = this.paths[p];
        path.isRetina = isRetina;
        path.draw(zoom.getTranState());
    }
};

Layer.prototype.hitTest = function(dt){
    var x = dt.x,
        y = dt.y,
        ox = dt.ox,
        oy = dt.oy;
    var isFind =0;
    this.selectedPath = null;
    for (var p in this.paths) {
        var path = this.paths[p];
        path.clearLight();
        if(!isFind){
            if( path.hitTest(x,y)){
                this.selectedPath  = path;
                path.earTouch(x,y);
                path.setLight();
                isFind = 1;    
            }
        }
    }
};


module.exports = Layer;

