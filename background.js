chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "play") {
    console.log("Play 명령 수신");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        });
      }
    });
  } else if (message.action === "stop") {
    console.log("Stop 명령 수신");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => location.reload(),
        });
      }
    });
  }
});
