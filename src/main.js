
var Mousetrap = require('./libs/mousetrap.js');
var draw = require('./draw');

var $ = require('jquery');

//写入控制菜单
var menus = require('./html/menu.html');
var scale = require('./html/scale.html');
var container = document.createElement('div');
var $container = $(container);
$container.addClass('ruler-fix-bar').addClass('clearfix');
$container.append(scale());
$container.append(menus());

draw.init();

var initDraw = function () {
    document.body.appendChild(container);
    draw.appendCanvasToBody();
    bindMenu();
};

//绑定菜单事件
var bindMenu = function () {
    var $rulerPanel = $('#ruler-panel');
    var menuZI = $('.scale-panel .zoom-in');
    var menuZO = $('.scale-panel .zoom-out');
    var menuPan = $('#menu_pan');
    var menuMeasure = $("#menu_measure");
    var menuClose = $('#menu_close');
    var progress = $('.scale-panel progress');

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
        $rulerPanel.removeAttr('class').addClass('pan');
    }

    var measure = function (e) {
        draw.action = 1;
        var menu = e.target;
        lightMenu(menu);
        $rulerPanel.removeAttr('class');
    }

    menuZI.click (() => {
        draw.zoomIn();
        progress.val(draw.getLevel());
    });
    menuZO.click(() => {
        draw.zoomOut();
        progress.val(draw.getLevel());
    });
    menuPan.click(pan);
    menuMeasure.click(measure);
    menuClose.click(close);

    //绑定快捷键
    Mousetrap.bind('alt+=', () => { menuZI.click() });
    Mousetrap.bind('alt+-', () => { menuZO.click() });
    Mousetrap.bind('h', () => { menuPan.click(); });
    Mousetrap.bind('m', () => { menuMeasure.click(); });
    Mousetrap.bind(['backspace', 'del'], () => {
        draw.deletePath();
    });

    Mousetrap.bind('left', (e) => { 
        e.preventDefault(); 
        draw.moveLeft(); });
    Mousetrap.bind('right', (e) => { 
        e.preventDefault(); 
        draw.moveRight();
     });
    Mousetrap.bind('up', (e) => { 
        e.preventDefault(); 
        draw.moveUp(); 
    });
    Mousetrap.bind('down', (e) => {
        e.preventDefault();
        draw.moveDown();
    });
};

var getScreenShot = function () {
    chrome.runtime.sendMessage({ n: "sall" }, function (response) {
        initDraw();
        draw.start();
        draw.setScreenShotUrl(response);
        // console.log('end:',Date.now());
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
}

