
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

bg.setBG = function (screenShot,isRetina) {
    var image = new Image();
    image.src = screenShot;
    this.background = image;;
    this.imgW = image.width;
    this.imgH = image.height;
}

//背景图
bg.drawBG = function(){
    var _ = this;
    var ctx = _.ctx;
    if(_.background){
        ctx.drawImage(_.background,0,0,_.imgW,_.imgH);
        // ctx.strokeStyle = "green";
        // ctx.strokeRect(0,0,_.imgW,_.imgH);
    }
};

module.exports = bg;

