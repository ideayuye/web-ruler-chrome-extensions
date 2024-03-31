var listener = function (message, sender, sendResponse) {
  console.log(message, "getMessage");
  chrome.tabs.captureVisibleTab({ format: "png" }, function (screenshotUrl) {
    var dpr = message.dpr;
    sendResponse({
      screenshot: screenshotUrl,
      dpr: dpr,
    });
  });
  return true;
};

// function injectCSS(tabId) {
//   // 加载 CSS 文件内容
//   return fetch(chrome.runtime.getURL("content.css"))
//     .then((response) => response.text())
//     .then((cssContent) => {
//       // 创建一个包含 CSS 内容的字符串
//       const styleContent = `const style = document.createElement('style'); style.textContent = \`${cssContent}\`; document.head.appendChild(style);`;

//       // 使用 executeScript 将 CSS 插入到当前标签页
//       chrome.scripting.executeScript({
//         target: { tabId },
//         func: function () {
//           eval(styleContent);
//         },
//       });
//     })
//     .catch((error) => console.error("Failed to load or inject CSS:", error));
// }

chrome.runtime.onInstalled.addListener(async () => {
  // await chrome.scripting.ensureServiceWorkerReady({
  //   serviceWorkerScript: "index.js",
  // });

  // 现在可以安全地添加事件监听器
  //   chrome.action.onClicked.addListener((tab) => {
  //     // ... your onClicked logic here ...
  //   });

  chrome.action.onClicked.addListener(function () {
    // chrome.tabs.create({url:"https://indus.site/"});
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(
        tabId,
        { detectContentScript: 1 },
        function (response) {
          if (!response || !response.isInjected) {
            chrome.scripting
              .insertCSS({
                files: ["content.css"],
                target: { tabId: tabId },
              })
              .then(() => {
                chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  files: ["content_script.js"],
                });
              });
          }
        }
      );
    });

    !chrome.runtime.onMessage.hasListener(listener) &&
      chrome.runtime.onMessage.addListener(listener);
  });
});
