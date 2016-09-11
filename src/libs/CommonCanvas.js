
/*
*@description  canvas 通用类
*/

var Canvas = function(){
    this.canvas = document.createElement('canvas');
    this.context =this.canvas.getContext('2d');
    this.isRetina = false;
    this.ww = 0;
    this.wh = 0;
}

/*
* @description 设置canvas的宽高 适配retina
*/ 
Canvas.prototype.setBox = function(ww,wh,isRetina){
        this.isRetina = isRetina;
        this.canvas.setAttribute('width', ww);
        this.canvas.setAttribute('height', wh);
        if(isRetina){
            this.canvas.style.width = Math.round(ww*0.5)+"px";
            this.canvas.style.height = Math.round(wh*0.5)+"px";
        }else{
            this.canvas.style.width = ww+"px";
            this.canvas.style.height = wh+"px";
        }
        this.ww = ww;
        this.wh = wh;
    }

module.exports = Canvas;

