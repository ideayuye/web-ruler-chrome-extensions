
var $ = require('jquery');
var EventProxy = require('eventproxy');
var zoom = require('./zoom.js');
var process = require('./reducers/combineReducers.js');
var CommomCanvas = require('./libs/CommonCanvas.js');
var createStore = require('redux').createStore;
var map = require('./map.js');
var interpreter = require('./libs/interpreter.js');
var TWEEN = require('tween.js');
var detector = require('./detector'),
    isMac = detector.os === "Mac",
    isMobile = detector.isMobile ,
    vCanvas = null,
    bCanvas = null,
    store = null;

var dw = {
    /*
        当前绘制动作
        动作说明：
        0-无操作
        1-绘制标注线
        2-平移图片
        3-选取对象
    */
    action: 1,
    /*
        当前鼠标状态
        0-默认
        1-移动状态
    */
    cursor: 0,
    ep:new EventProxy(),
    dpr : 1
};

/*初始state*/
var initState = {
    draw: {
        curPath: null,
        isUpdate: false
    },
    control: {
        isPan: 0,
        startX: 0,
        startY: 0,
        mx: 0,//水平平移量
        my: 0,//垂直平一量
        isUpdate:false
    },
    edit:{
        isMove :0,
        lastX:0,
        lastY:0,
        isNodeMove :0
    }
}

var vCanvas = null,
    bCanvas = null,
    store = null;

/*初始化mark面板*/
dw.init = function () {
    vCanvas = new CommomCanvas();
    bCanvas = new CommomCanvas();

    vCanvas.canvas.setAttribute('id', 'ruler-panel');

    map.cacheCtx = bCanvas.context;
    map.viewCtx = vCanvas.context;
    /*测试*/
    // document.body.appendChild(bCanvas.canvas);
    // bCanvas.canvas.setAttribute('id', 'ruler-panel');
    /*测试*/
    this.bindStore();
    animate();
}

dw.setDpr = function(dpr){
    this.dpr = dpr;
}

dw.appendCanvasToBody=function(){
    document.body.appendChild(vCanvas.canvas);
}

dw.getLevel = function(){
    return zoom.level;
}

/*设置截取的背景图*/
dw.setScreenShotUrl = function (screenShot) {
    var image = new Image();
        image.src = screenShot;
        image.onload=()=>{
            var imgW = image.width,
                imgH = image.height;
                console.log(imgW,imgH,'nii',image)
            bCanvas.setBox(imgW, imgH,this.dpr);
            vCanvas.setBox(imgW, imgH,this.dpr);
            zoom.init(imgW, imgH,this.dpr);
            zoom.setCenter(imgW, imgH);

            store.dispatch({ type: 'setbackground', screenShot: screenShot });
        }
}

/*绑定绘制动作*/
dw.bindDraw = function () {
    var that = this;
    var wrapperData = function (type, e) {
        if(isMobile){
            var touch = e.touches && e.touches.length ? e.touches[0]:touch;
            if(touch){
                e.x = touch.clientX;
                e.y = touch.clientY;
            }
        }
        var x = e.x||e.offsetX||0;
            y = e.y||e.offsetY||0;
        var ne = zoom.transCoord(x, y);
        return {
            mouseType: type,
            ox: x,
            oy: y,
            x: ne.x,
            y: ne.y,
            action: that.action
        };
    };
    var $c = $(vCanvas.canvas);
    $c.on('mousedown touchstart', function (e) {
        var data = wrapperData('mousedown', e);
        var type = interpreter.parse(store.getState(),that.action,data.mouseType,map);
        store.dispatch({ type: type, data: data });
    });
    $c.on('mouseup touchend', function (e) {
        var data = wrapperData('mouseup', e);
        var type = interpreter.parse(store.getState(),that.action,data.mouseType,map);
        store.dispatch({ type:type, data: data });
    });
    $c.on('mousemove touchmove', function (e) {
        var data = wrapperData('mousemove', e);
        var type = interpreter.parse(store.getState(),that.action,data.mouseType,map);
        store.dispatch({ type:type, data: data });
    });
};



//设置鼠标状态
dw.setCursor = function(){
    var oldCursor = this.cursor;
    if (map.getSelectedPath()) {
        this.cursor = 0;
    }else{
        if(this.action == 2){
            this.cursor = 1;
        }else{
            this.cursor = 0;
        }
    }
    if(oldCursor != this.cursor){
        this.ep.emit('cursorChange',this.cursor);
    }
}


dw.bindStore = function () {
    store = createStore(process, initState);
    store.subscribe(function () {
        dw.setCursor();
        // 需要时刷新图形
        var state = store.getState();
        draw = state && state.draw;
        if (draw && draw.isUpdate) {
            dw.drawCache();
            draw.isUpdate = false;
        }
    });
    store.subscribe(function(){
        var state = store.getState();
        control = state && state.control;
        if (control && control.isUpdate) {
            //计算坐标
            control.isUpdate = false;
        }
    });
};


dw.deletePath = function(){
    var path = map.getSelectedPath();
    if(path)
        map.curLayer.remove(path.id);
}

dw.zoomInAni = function(){
    // store.dispatch({ type: 'zoom_in_ani'});
    return  zoom.zoomInAni();
};

dw.zoomOutAni = function(){
    return zoom.zoomOutAni();
    // store.dispatch({type: 'zoom_out_ani'});
};

/*背景绘制*/
dw.drawCache = function () {
    bCanvas.context.clearRect(0, 0, bCanvas.ww,bCanvas.wh);
    map.bg && map.bg.drawBG(zoom.getTranState());
    map.curLayer.draw(this.dpr);
    map.tempLayer.draw(this.dpr);
    
};

var animationFrame = null;
/*启动动画*/
var animate = function () {
    var ctx = vCanvas.context;
    TWEEN.update();
    dw.drawCache();
    ctx.clearRect(0, 0, vCanvas.ww,vCanvas.wh);
    ctx.drawImage(bCanvas.canvas,0,0, vCanvas.ww,vCanvas.wh);
    //绘制中心点 辅助计算坐标
    /*ctx.beginPath();
    ctx.arc(vCanvas.ww*0.5,vCanvas.wh*0.5,7,0,Math.PI*2);
    ctx.stroke();*/
    animationFrame = window.requestAnimationFrame(animate);
};

dw.stop = function(){
    window.cancelAnimationFrame(animationFrame);
    map.clear();
    zoom.reset();
};

dw.start = function(){
    this.bindDraw();
    animate();
}


// 微调mark元素
dw.moveLeft = function(){
    var path = map.getSelectedPath();
    path.move(-1,0);
}

dw.moveRight = function(){
    var path = map.getSelectedPath();
    path.move(1,0);
}

dw.moveUp = function(){
    var path = map.getSelectedPath();
    path.move(0,-1);
}

dw.moveDown = function(){
    var path = map.getSelectedPath();
    path.move(0,1);
}


module.exports = dw;


