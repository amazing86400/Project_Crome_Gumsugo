chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "lock") {
    console.log("Lock 명령 수신");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        });
      }
    });
  } else if (message.action === "open") {
    console.log("Open 명령 수신");
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
