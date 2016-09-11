
var $ = require('jquery');
var zoom = require('./zoom.js');
var process = require('./reducers/combineReducers.js');
var CommomCanvas = require('./libs/CommonCanvas.js');
var createStore = require('redux').createStore;
var map = require('./map.js');
var interpreter = require('./libs/interpreter.js');
var os = require('./detectOS')(),
    isMac = os === "Mac",
    dpr = window.devicePixelRatio,
    isRetina = isMac && dpr == 2,
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
    action: 1
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
    var imgW = image.width,
        imgH = image.height;
    bCanvas.setBox(imgW, imgH,isRetina);
    vCanvas.setBox(imgW, imgH,isRetina);
    zoom.init(imgW, imgH,isRetina);
    zoom.setCenter(imgW, imgH);

    store.dispatch({ type: 'setbackground', screenShot: screenShot });
}

/*绑定绘制动作*/
dw.bindDraw = function () {
    var that = this;
    var wrapperData = function (type, e) {
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

dw.bindStore = function () {
    store = createStore(process, initState);
    store.subscribe(function () {
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
            zoom.calViewBox();
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

dw.zoomIn = function(){
    store.dispatch({ type: 'zoom_in'});
};

dw.zoomOut = function(){
    store.dispatch({type: 'zoom_out'});
};

/*背景绘制*/
dw.drawCache = function () {
    bCanvas.context.clearRect(0, 0, bCanvas.ww,bCanvas.wh);
    map.bg.drawBG();
};

var animationFrame = null;
/*启动动画*/
var animate = function () {
    var box = zoom.viewBox;
    var ctx = vCanvas.context;
    if(box){
        ctx.clearRect(0, 0, vCanvas.ww,vCanvas.wh);
        ctx.drawImage(bCanvas.canvas, box.sx, box.sy, box.sw, box.sh, box.dx, box.dy, box.dw, box.dh);
        map.curLayer.draw(isRetina);
        map.tempLayer.draw(isRetina);
    }
    animationFrame = window.requestAnimationFrame(animate);
};

dw.stop = function(){
    window.cancelAnimationFrame(animationFrame);
    map.clear();
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


