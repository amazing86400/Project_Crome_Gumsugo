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
    let postData = [];

    if (details.method === "POST" && details.requestBody) {
      if (details.requestBody.formData) {
        postData = details.requestBody.formData;
      } else if (details.requestBody.raw) {
        const decoder = new TextDecoder("utf-8");
        const decodedString = decoder.decode(details.requestBody.raw[0].bytes);
        postData = new URLSearchParams(decodedString);
      }
    }

    const extractedData = [];
    if (postData instanceof URLSearchParams) {
      extractedData.push({
        tid: urlParams.get("tid"),
        _p: urlParams.get("_p"),
        cid: urlParams.get("cid"),
        sid: urlParams.get("sid"),
        dl: urlParams.get("dl"),
        dr: urlParams.get("dr"),
        dt: urlParams.get("dt"),
        en: postData.get("en"),
        ep: postData.get("ep."),
        up: postData.get("up."),
      });
    } else {
      extractedData.push({
        tid: urlParams.get("tid"),
        _p: urlParams.get("_p"),
        cid: urlParams.get("cid"),
        sid: urlParams.get("sid"),
        dl: urlParams.get("dl"),
        dr: urlParams.get("dr"),
        dt: urlParams.get("dt"),
        en: urlParams.get("en"),
        ep: urlParams.get("ep."),
        up: urlParams.get("up."),
      });
    }

    chrome.runtime.sendMessage({
      action: "ga4_event",
      data: extractedData,
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);
