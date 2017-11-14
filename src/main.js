
var Mousetrap = require('./libs/mousetrap.js');
var draw = require('./draw');
var $ = require('jquery');

//写入控制菜单
var menus = require('./html/menu.html');
var scale = require('./html/scale.html');
var container = document.createElement('div');
var progress;//缩放比例尺
var $container = $(container);
$container.addClass('ruler-fix-bar').addClass('clearfix');
$container.append(scale());
$container.append(menus());

draw.init();

var initDraw = function () {
    document.body.appendChild(container);
    draw.appendCanvasToBody();
    bindMenu();
    bindCursorChange();
};

var bindCursorChange = function () {
    var $rulerPanel = $('#ruler-panel');
    draw.ep.on('cursorChange', function (cursor) {
        switch (cursor) {
            case 0:
                $rulerPanel.removeAttr('class');
                break;
            case 1:
                $rulerPanel.removeAttr('class').addClass('pan');
                break;
        }
    });
}

//绑定菜单事件
var bindMenu = function () {
    var menuZI = $('.scale-panel .zoom-in');
    var menuZO = $('.scale-panel .zoom-out');
    var menuPan = $('#menu_pan');
    var menuMeasure = $("#menu_measure");
    var menuClose = $('#menu_close');
    progress = $('.scale-panel progress');

    var lightMenu = function (menu) {
        var list = document.querySelectorAll('#TMK_menus li');
        for (var i = 0; i < list.length; i++) {
            var m = list.item(i);
            m.removeAttribute('class');
        }
        menu.setAttribute('class', 'current');
    };

    var pan = function (e) {
        draw.action = 2;
        var menu = e.target;
        lightMenu(menu);
        draw.setCursor();
    }

    var measure = function (e) {
        draw.action = 1;
        var menu = e.target;
        lightMenu(menu);
        draw.setCursor();
    }

    menuZI.click(zoomIn);
    menuZO.click(zoomOut);
    menuPan.click(pan);
    menuMeasure.click(measure);
    menuClose.click(close);

    //绑定快捷键
    Mousetrap.bind('alt+=', function () { menuZI.click() });
    Mousetrap.bind('alt+-', function () { menuZO.click() });
    Mousetrap.bind('h', function () { menuPan.click(); });
    Mousetrap.bind('d', function () { menuMeasure.click(); });
    Mousetrap.bind(['backspace', 'del'], function () { draw.deletePath(); });

    Mousetrap.bind('left', function (e) {
        e.preventDefault();
        draw.moveLeft();
    });
    Mousetrap.bind('right', function (e) {
        e.preventDefault();
        draw.moveRight();
    });
    Mousetrap.bind('up', function (e) {
        e.preventDefault();
        draw.moveUp();
    });
    Mousetrap.bind('down', function (e) {
        e.preventDefault();
        draw.moveDown();
    });
};


/*
*@description 滚轮事件
*/
var freezeZoom = 0;
var mouseWheelZoom = function (e) {
    e.preventDefault();
    //+ 缩小  -放大
    var delta = e.wheelDelta;
    if(delta>0){
        zoomOut();
    }
    if(delta < 0 ){
        zoomIn();
    }
    /*switch (e.deltaY) {
        case 100:
            zoomOut();
            break;
        case -100:
            zoomIn();
            break;
        default:
            break;
    }*/
}

var zoomOut = function () {
    if (freezeZoom)
        return;
    freezeZoom = 1;
    draw.zoomOutAni().then(function () {
        progress.val(draw.getLevel());
    }).finally(function () {
        freezeZoom = 0;
    });
}

var zoomIn = function () {
    if (freezeZoom)
        return;
    freezeZoom = 1;
    draw.zoomInAni().then(function () {
        progress.val(draw.getLevel());
    }).finally(function () {
        freezeZoom = 0;
    });
}

var getScreenShot = function () {
    chrome.runtime.sendMessage({ n: "sall" }, function (response) {
        var screenshot = response.screenshot;
        var dpr = response.dpr;
        draw.setDpr(dpr);
        initDraw();
        draw.setScreenShotUrl(screenshot);
        draw.start();
        window.addEventListener('mousewheel', mouseWheelZoom);
    });
}

getScreenShot();

//检查是否contentscript已经注入
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.detectContentScript) {
        //已注入开启功能
        if (!$('#ruler-panel').length)
            getScreenShot();
        // console.log('start:',Date.now());
        sendResponse({ isInjected: 1 });
    }
    return true;
});



//关闭ruler
var close = function () {
    //移除dom
    $container.remove();
    $('#ruler-panel').remove();
    draw.stop();
    //解除事件
    Mousetrap.reset();
    window.removeEventListener('mousewheel', mouseWheelZoom);
}

