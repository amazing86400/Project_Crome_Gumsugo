chrome.runtime.onMessage.addListener((message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;

    if (message.action === "lock") {
      console.log("Lock 명령 수신");
      chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ["content.js"] });
    } else if (message.action === "open") {
      console.log("Open 명령 수신");
      chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => location.reload() });
    }
  });
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.url.includes("/g/collect?v=2")) return;

    const urlParams = new URL(details.url).searchParams;
    let postData = {};

    if (details.method === "POST" && details.requestBody) {
      if (details.requestBody.formData) {
        postData = details.requestBody.formData;
      } else if (details.requestBody.raw) {
        const decoder = new TextDecoder("utf-8");
        postData = decoder.decode(details.requestBody.raw[0].bytes);
      }
    }

    chrome.runtime.sendMessage({
      action: "ga4_event",
      data: {
        eventType: urlParams.get("en") || "Unknown Event",
        eventParams: decodeURIComponent(urlParams.get("ep") || "{}"),
        postPayload: postData, // Request Payload 데이터 추가
        url: details.url,
      },
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);
