
/*
根据缩放的等级 计算可视区域
*/

var TWEEN = require('tween.js');
var Q     = require('q');

var zoom = {
    /*等级从1到10，1是1：1的*/
    level:1,
    //显示屏宽高
    ww:0,
    wh:0,
    //全景宽高
    mw:0,
    mh:0,
    viewBox :null,
    offsetX :0,
    offsetY :0,
    //缩放系数
    zoomFactor : 1.4,
    dpr :1
};

zoom.reset=function(){
    this.level =1;
    this.offsetX = 0;
    this.offsetY = 0;
};

zoom.init = function (ww,wh,dpr) {
    var _ = this;
    _.ww = ww;
    _.wh = wh;
    _.dpr = dpr;
};

/*
设置中心点
 */
zoom.setCenter=function(mw,mh){
    var _ = this;
    this.mw = mw;
    this.mh = mh;
};


/*坐标变换*/
zoom.transCoord = function(x,y){
    // 更具中心点 缩放比例 计算新坐标位置
    var nc = {x:0,y:0};
    var _ = this;
        x = x*_.dpr;
        y = y*_.dpr;
    
    nc.x = (x +_.mw*(_.level-1)*0.5 )/_.level -_.offsetX*(_.level-1)/_.level - _.offsetX/_.level;
    nc.y = (y +_.mh*(_.level-1)*0.5 )/_.level -_.offsetY*(_.level-1)/_.level - _.offsetY/_.level;
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
};

zoom.zoomInAni = function () {
    var _ = this;
    var end = _.zoomFactor*_.level;
        end = end > 10? 10:end;
    return Q.Promise(function (resolve, reject) {
        if (_.level < 10) {
            _.zoomAnimate(_.level, end).done(function(){
                resolve();
            });
        }else{
            reject();
        }
    });
}

zoom.zoomOutAni = function(){
    var _ = this;
    var end = _.level/_.zoomFactor;
        end = end < 1? 1:end;
    return Q.Promise(function (resolve, reject) {
        if (_.level > 1) {
            _.zoomAnimate(_.level, end).done(function(){
                resolve();
            });
        }else{
            reject();
        }
    });
}

zoom.zoomAnimate = function (start, end) {
    var _ = this;
    return Q.Promise(function (resolve, reject) {
        (new TWEEN.Tween({ level: start }))
            .to({ level: end }, 300)
            .onUpdate(function () {
                _.level = this.level;
            })
            .onComplete(function () {
                resolve();
            })
            .start();
    });
};

/*平移*/
zoom.move = function(mx,my){
    mx = mx*this.dpr;
    my = my*this.dpr;
    
    this.offsetX -= mx/this.level;
    this.offsetY -= my/this.level;
};


/*
*@description 计算图形状态 偏移量 缩放比例
*/
zoom.getTranState=function(){
    var _=this;
    //调整因为缩放引起的中心点便宜
    var mx = 0,my = 0;
    //调整因为缩放引起的偏移 
    mx = -_.mw*(_.level-1)*0.5 ;
    my = -_.mh*(_.level-1)*0.5 ;

    //添加考虑当前中心点位置
    mx += _.offsetX*(_.level-1);
    my += _.offsetY*(_.level-1);

    //手动偏移量
    mx = mx + _.offsetX;
    my = my + _.offsetY;

    return{
        scale:_.level,
        offsetX:mx,
        offsetY:my
    }
}


module.exports = zoom; 


