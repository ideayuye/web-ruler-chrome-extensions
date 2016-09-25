
/*
根据缩放的等级 计算可视区域
*/

var zoom = {
    /*等级从1到10，1是1：1的*/
    level:1,
    /*中心点*/
    center:{x:0,y:0},
    //显示屏宽高
    ww:0,
    wh:0,
    //全景宽高
    mw:0,
    mh:0,
    isRetina:false,
    viewBox :null,
    offsetX :0,
    offsetY :0
};

zoom.init = function (ww,wh,isRetina) {
    var _ = this;
    _.center.x = ww*0.5;
    _.center.y = wh*0.5;
    _.ww = ww;
    _.wh = wh;
    _.isRetina = isRetina;
    _.calViewBox();
};

/*
设置中心点
 */
zoom.setCenter=function(mw,mh){
    var _ = this;
    this.mw = mw;
    this.mh = mh;
    this.center.x = mw*0.5;
    this.center.y = mh*0.5;
};

/*
计算可视区域 转化可视区域到
*/
zoom.calViewBox = function () {
    var _ = this;
    var box = {
        sx:0,
        sy:0,
        sw:0,
        sh:0,
        dx:0,
        dy:0,
        dw:_.ww,
        dh:_.wh
    }

    box.sw = _.ww/_.level;
    box.sx = _.center.x -  box.sw*0.5;
    box.sh = _.wh/_.level;
    box.sy = _.center.y - box.sh*0.5;

    if(box.sx < 0 ){
        box.dx = -box.sx;
        box.sx = 0;
    }

    if(box.sy < 0){
        box.dy = -box.sy;
        box.sy = 0;
    }

    _.viewBox = box;
};

/*坐标变换*/
zoom.transCoord = function(x,y){
    // 更具中心点 缩放比例 计算新坐标位置
    var nc = {x:0,y:0};
    var _ = this;
    if(_.isRetina){
        x = 2*x;
        y = 2*y;
    }
    nc.x = (x +_.mw*(_.level-1)*0.5 - _.offsetX)/_.level;
    nc.y = (y +_.mh*(_.level-1)*0.5 - _.offsetY)/_.level;
    return nc;
};


/*放大*/
zoom.zoomIn = function(){
    if(this.level<10)
        this.level ++;
};

/*缩小*/
zoom.zoomOut = function(){
    if(this.level > 1)
        this.level--;
}

/*平移*/
zoom.move = function(mx,my){
    if(this.isRetina){
        mx = mx*2;
        my = my*2;
    }
    this.center.x += mx/this.level;
    this.center.y += my/this.level;
    this.offsetX -= mx;
    this.offsetY -= my;
};

/*
*@description 计算图形状态 偏移量 缩放比例
*/
zoom.getTranState=function(){
    var _=this;
    //调整因为缩放引起的偏移
    var mx = -_.mw*(_.level-1)*0.5/_.level;
    var my = -_.mh*(_.level-1)*0.5/_.level;
    //手动偏移量
    mx = mx + _.offsetX/_.level;
    my = my + _.offsetY/_.level;
    return{
        scale:_.level,
        offsetX:mx,
        offsetY:my
    }
}

module.exports = zoom; 


