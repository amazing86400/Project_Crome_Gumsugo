var sortObj = [];

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

  if (message.action == "setSortOrder" && message.cleanedSortObj) {
    sortObj = message.cleanedSortObj;
  }
});

function setParams(searchParam, type, isEcommerce) {
  const ecemmerceParams = ["ep.currency", "ep.transaction_id", "ep.coupon", "epn.value", "epn.tax", "epn.shipping"];
  let returnArr = [];

  if (isEcommerce) {
    searchParam.forEach((value, key) => {
      if (ecemmerceParams.includes(key)) {
        var isNum = key.includes('epn.') ? Number(value) : value;
        returnArr.push({key: key.split('.')[1], value: isNum});
      }
    });
  } else {
    searchParam.forEach((value, key) => {
      if (!ecemmerceParams.includes(key) && key.includes(type)) {
        var isNum = type == 'epn.' ? Number(value) : value;
        returnArr.push({key: key, value: isNum});
      }
    });
  }
  return returnArr;
}

function parseProductString(productString) {
  const parts = productString.split("~");
  const result = [];
  let lastKey = "";

  for (let i = 0; i < parts.length; i++) {
    let key = parts[i].substring(0, 2);
    let value = parts[i].substring(2);

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
  }

  return result;
}

function sortParams(paramArray, sortKeys, prefix) {
  const convertItem = {
    id: 'item_id',
    nm: 'item_name',
    lp: 'index',
    br: 'item_brand',
    ca: 'item_category',
    c2: 'item_category2',
    c3: 'item_category3',
    c4: 'item_category4',
    c5: 'item_category5',
    pr: 'price',
    qt: 'quantity',
    va: 'item_variant',
    cp: 'coupon',
    ds: 'discount',
    li: 'item_list_id',
    ln: 'item_list_name',
    af: 'affiliation',
    lo: 'location_id',
  };

  sortKeys = sortKeys ?? [];
  const sortedParams = sortKeys.map((key) => {
    const fullKey = `${prefix}${key}`;
    const found = paramArray.find((item) => {
      const convertedKey = convertItem[item.key] || item.key;
      return convertedKey === fullKey;
    });

    return found ? { key: convertItem[found.key] || found.key, value: found.value } : { key: fullKey, value: undefined };
  });

  const remainingParams = paramArray.filter((item) => {
    const convertedKey = convertItem[item.key] || item.key;
    return !sortKeys.includes(convertedKey.replace(prefix, ""));
  });

  return [...sortedParams, ...remainingParams];
}

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

    // 배열로 한 이유?
    const extractedData = [];
    const params = postData instanceof URLSearchParams ? postData : urlParams;

    extractedData.push({
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
    });

    const lastEntry = extractedData[0];
    params.forEach((value, key) => {
      if (!key.startsWith("pr")) return;

      lastEntry[key] = parseProductString(value);
      lastEntry[key] = sortParams(lastEntry[key], sortObj.itemParam, "");
    });

    lastEntry.eco.push({key: 'currency', value: urlParams.get('cu')});
    lastEntry.ep = sortParams(lastEntry.ep, sortObj.eventParam, "ep.");
    lastEntry.epn = sortParams(lastEntry.epn, sortObj.metricParam, "epn.");
    lastEntry.eco = sortParams(lastEntry.eco, sortObj.ecommerceParam, "");
    lastEntry.up = sortParams(lastEntry.up, sortObj.userParam, "up.");

    console.log("정렬 완료:", extractedData);

    chrome.runtime.sendMessage({
      action: "ga4_event",
      data: extractedData,
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
);
