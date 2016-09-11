

var listener = function (message, sender, sendResponse) {
    chrome.tabs.captureVisibleTab({ format: 'png' }, function (screenshotUrl) {
        sendResponse(screenshotUrl);
    });
    return true;
};

chrome.browserAction.onClicked.addListener(function () {
    // chrome.tabs.create({url:"https://indus.site/"});
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { detectContentScript: 1 }, function (response) {
            if (!response || !response.isInjected) {
                chrome.tabs.insertCSS(null, { file: 'content.css' }, function () {
                    chrome.tabs.executeScript(null, { file: 'content_script.js' }, function () {

                    });
                });
            }
        });    
    });

    !chrome.runtime.onMessage.hasListener(listener)&&
        chrome.runtime.onMessage.addListener(listener);
});



