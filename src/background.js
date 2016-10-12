
/*
*背景图操作类
*/

var bg = {
    ctx:null,
    //背景图
    background:null,
    imgW:0,
    imgH:0
};

bg.init = function(ctx){
    this.ctx = ctx;
};

bg.setBG = function (screenShot) {
    var image = new Image();
    image.src = screenShot;
    this.background = image;;
    this.imgW = image.width;
    this.imgH = image.height;
}

var zoom  = require('./zoom.js');

//背景图
bg.drawBG = function(transform){
    var _ = this;
    var ctx = _.ctx;
    var scale = transform.scale;
    //手动平移量
    var ox = transform.offsetX;
    var oy = transform.offsetY;
    if(_.background){
        ctx.save();
        ctx.translate(ox,oy);
        ctx.scale(scale,scale);
        ctx.drawImage(_.background,0,0,_.imgW,_.imgH);
        //绘制中心点
        ctx.beginPath();
        ctx.arc(_.imgW*0.5, _.imgH*0.5, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
};

module.exports = bg;

