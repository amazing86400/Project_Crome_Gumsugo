let sortObj = [];
let tabRequestData = {};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "devtools") {
    console.log("DevTools 패널이 연결됨");

    port.onDisconnect.addListener(() => {
      console.log("DevTools 패널이 닫힘");
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message.action) return;

  if (message.action === "clear_tab_data") {
    const { tabId } = message;
    if (tabRequestData[tabId]) {
      delete tabRequestData[tabId];
      console.log(`탭 ${tabId}의 데이터 삭제 완료`);
      sendResponse({ success: true });
    } else {
      console.log(`탭 ${tabId}의 데이터가 존재하지 않음`);
      sendResponse({ success: false });
    }
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) return;

    const tabId = tabs[0].id;

    switch (message.action) {
      case "lock":
        console.log("Lock 명령 수신");
        chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
        break;
      case "open":
        console.log("Open 명령 수신");
        chrome.scripting.executeScript({ target: { tabId }, func: () => location.reload() });
        break;
      case "setSortOrder":
        if (message.cleanedSortObj) {
          sortObj = message.cleanedSortObj;
        }
        break;
    }
  });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabRequestData[tabId]) {
    delete tabRequestData[tabId];
    console.log(`탭 ${tabId}이 닫힘. 데이터 삭제 완료`);
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.url.includes("/g/collect?v=2") || details.initiator.startsWith("chrome-extension://")) return;
    if (!details.tabId || details.tabId < 0) return;

    tabRequestData[details.tabId] = tabRequestData[details.tabId] || [];

    const urlParams = new URL(details.url).searchParams;
    const postData = extractPostData(details);
    const params = postData instanceof URLSearchParams ? postData : urlParams;

    const extractedData = {
      tid: urlParams.get("tid"),
      _p: urlParams.get("_p"),
      cid: urlParams.get("cid"),
      sid: urlParams.get("sid"),
      dl: urlParams.get("dl"),
      dr: urlParams.get("dr"),
      dt: urlParams.get("dt"),
      en: params.get("en"),
      ep: setParams(params, "ep."),
      epn: setParams(params, "epn."),
      eco: setParams(params, "", true),
      up: setParams(params, "up."),
    };

    params.forEach((value, key) => {
      if (key.startsWith("pr")) {
        extractedData[key] = sortParams(parseProductString(value), sortObj.itemParam);
      }
    });

    if (urlParams.get("cu")) extractedData.eco.push({ key: "currency", value: urlParams.get("cu") });
    extractedData.ep = sortParams(extractedData.ep, sortObj.eventParam, "ep.");
    extractedData.epn = sortParams(extractedData.epn, sortObj.metricParam, "epn.");
    extractedData.eco = sortParams(extractedData.eco, sortObj.ecommerceParam);
    extractedData.up = sortParams(extractedData.up, sortObj.userParam, "up.");

    tabRequestData[details.tabId].push(extractedData);
    console.log(`탭 ${details.tabId}에서 발생한 요청:`, extractedData);

    chrome.runtime.sendMessage(
      {
        action: "ga4_event",
        tabId: details.tabId,
        data: extractedData,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log("DevTools 패널이 닫혀 있어 메시지를 보낼 수 없음");
        }
      }
    );
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);

function extractPostData(details) {
  if (details.method !== "POST" || !details.requestBody) return [];
  if (details.requestBody.formData) return details.requestBody.formData;

  if (details.requestBody.raw) {
    const decodedString = new TextDecoder("utf-8").decode(details.requestBody.raw[0].bytes);

    return new URLSearchParams(decodedString);
  }

  return [];
}

function setParams(searchParam, type, isEcommerce = false) {
  const ecemmerceParams = ["ep.currency", "ep.transaction_id", "ep.coupon", "epn.value", "epn.tax", "epn.shipping"];

  return Array.from(searchParam).reduce((result, [key, value]) => {
    const includeCondition = isEcommerce ? ecemmerceParams.includes(key) : key.includes(type) && !ecemmerceParams.includes(key);

    if (includeCondition) {
      result.push({ key: key.split(".")[1] || key, value: key.startsWith("epn.") ? Number(value) : value });
    }

    return result;
  }, []);
}

function sortParams(paramArray, sortKeys = [], prefix = "") {
  const convertItem = {
    id: "item_id",
    nm: "item_name",
    lp: "index",
    br: "item_brand",
    ca: "item_category",
    c2: "item_category2",
    c3: "item_category3",
    c4: "item_category4",
    c5: "item_category5",
    pr: "price",
    qt: "quantity",
    va: "item_variant",
    cp: "coupon",
    ds: "discount",
    li: "item_list_id",
    ln: "item_list_name",
    af: "affiliation",
    lo: "location_id",
  };

  const sortedParams = sortKeys.map((key) => {
    const fullKey = `${prefix}${key}`;
    const found = paramArray.find((item) => (convertItem[item.key] || item.key) === fullKey);

    return found ? { key: convertItem[found.key] || found.key, value: found.value } : { key: fullKey, value: undefined };
  });

  const remainingParams = paramArray.filter((item) => !sortKeys.includes((convertItem[item.key] || item.key).replace(prefix, "")));

  return [...sortedParams, ...remainingParams];
}

function parseProductString(productString) {
  const parts = productString.split("~");
  const result = [];
  let lastKey = "";

  parts.forEach((part) => {
    let key = part.substring(0, 2);
    let value = part.substring(2);

    if (key.startsWith("k")) {
      lastKey = value;
    } else if (key.startsWith("v") && lastKey) {
      result.push({ key: lastKey, value });
      lastKey = "";
      // 실제로 string으로 수집할 경우 어떡하지?
    } else if (["lp", "qt", "pr", "ds"].includes(key)) {
      result.push({ key, value: Number(value) });
    } else {
      result.push({ key, value });
    }
  });

  return result;
}
