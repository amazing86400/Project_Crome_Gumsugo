let isProgress = false;
let isLock = false;

chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("GubGub DevTools 패널이 생성됨");
});

const port = chrome.runtime.connect({ name: "devtools" });

port.onDisconnect.addListener(() => {
  console.log("DevTools 패널이 닫혔으므로 메시지 전송을 중단합니다.");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== "ga4_event" || message.tabId !== chrome.devtools.inspectedWindow.tabId) return;

  const ga4Container = document.getElementById("ga4-data-container");
  const event = message.data;

  const requestEntry = document.createElement("div");
  requestEntry.classList.add("ga4-request");

  requestEntry.innerHTML = `
    <p><strong>Event Name:</strong> ${event.en} <span style="font-size:12px;color:#888;">(Click to expand)</span></p>
  `;

  const details = document.createElement("div");
  details.classList.add("ga4-details");

  const basicInfo = [
    { key: "GA4 속성 ID", value: event.tid },
    { key: "타임스탬프", value: event._p },
    { key: "Client ID", value: event.cid },
    { key: "Session ID", value: event.sid },
    { key: "현재 페이지 URL", value: event.dl },
    { key: "이전 페이지 URL", value: event.dr },
    { key: "페이지 제목", value: event.dt },
    { key: "이벤트 이름", value: event.en },
  ];
  const basicInfoSection = createSublist("기본 정보", basicInfo);
  if (basicInfoSection) details.appendChild(basicInfoSection);

  const dataSections = [
    { title: "맞춤 측정기준", data: event.ep },
    { title: "맞춤 측정항목", data: event.epn },
    { title: "거래 정보", data: event.eco },
    { title: "사용자 속성", data: event.up },
  ];

  dataSections.forEach(({ title, data }) => {
    if (Array.isArray(data) && data.length > 0) {
      const section = createSublist(title, data);
      if (section) details.appendChild(section);
    }
  });

  const productData = Object.keys(event)
    .filter((key) => key.startsWith("pr"))
    .flatMap((key) => event[key] || []);

  if (productData.length > 0) {
    const productInfoSection = createSublist("상품 정보", productData);
    if (productInfoSection) details.appendChild(productInfoSection);
  }

  requestEntry.appendChild(details);
  ga4Container.appendChild(requestEntry);

  requestEntry.addEventListener("click", (e) => {
    if (!e.target.closest(".ga4-sublist-title")) {
      requestEntry.classList.toggle("expanded");
    }
  });
});

function createTable(data) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  const table = document.createElement("table");
  table.classList.add("ga4-table");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Key</th>
      <th>Value</th>
    </tr>
  `;

  const tbody = document.createElement("tbody");

  data.forEach(({ key, value }) => {
    if (value) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${key}</td><td>${value}</td>`;
      tbody.appendChild(row);
    }
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  table.addEventListener("click", (e) => e.stopPropagation());

  return table;
}

function createSublist(title, data, formatter) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  const sublist = document.createElement("div");
  sublist.classList.add("ga4-sublist", "expanded");

  const sublistTitle = document.createElement("div");
  sublistTitle.classList.add("ga4-sublist-title");
  sublistTitle.textContent = title;
  sublist.appendChild(sublistTitle);

  const sublistContent = document.createElement("div");
  sublistContent.classList.add("ga4-sublist-content");

  if (formatter) {
    formatter(sublistContent, data);
  } else {
    const table = createTable(data);
    if (table) sublistContent.appendChild(table);
  }

  sublist.appendChild(sublistContent);

  sublistContent.addEventListener("click", (e) => e.stopPropagation());

  sublistTitle.addEventListener("click", (e) => {
    e.stopPropagation();
    sublist.classList.toggle("expanded");
  });

  return sublist;
}

// function appendProductData(container, event) {
//   let productData = [];
//   Object.keys(event)
//     .filter((key) => key.startsWith("pr"))
//     .forEach((key) => {
//       event[key]?.forEach(({ key: prKey, value }) => {
//         if (value) {
//           productData.push({ key: `${key} - ${prKey}`, value });
//         }
//       });
//     });

//   const table = createTable(productData);
//   if (table) container.innerHTML = table;
// }

function appendProductData(container, event) {
  const productData = Object.keys(event)
    .filter((key) => key.startsWith("pr"))
    .flatMap((key) => event[key] || []);

  const table = createTable(productData);
  if (table) container.appendChild(table);
}

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    playButton: document.getElementById("play-btn"),
    playIcon: document.getElementById("play-icon"),
    lockButton: document.getElementById("lock-btn"),
    lockIcon: document.getElementById("lock-icon"),
    clearButton: document.getElementById("clear-btn"),
    filterButton: document.getElementById("filter-btn"),
    sortButton: document.getElementById("sort-btn"),
    modalOverlay: document.querySelector(".modal-overlay"),
    tooltip: document.getElementById("tooltip"),
    ga4Container: document.getElementById("ga4-data-container"),
    sortSave: document.getElementById("sort-save"),
  };

  elements.playButton.addEventListener("click", () => togglePlay(elements));
  elements.lockButton.addEventListener("click", () => toggleLock(elements));
  elements.clearButton.addEventListener("click", () => clearGA4Data(elements.ga4Container));
  elements.sortButton.addEventListener("click", () => toggleModal(true));
  elements.modalOverlay.addEventListener("click", () => toggleModal(false));
  elements.sortSave.addEventListener("click", saveSortOrder);
  addTooltipListeners(elements.tooltip);

  elements.filterButton.addEventListener("click", () => {});
});

function togglePlay({ playButton, playIcon, lockButton }) {
  if (isLock) return;

  isProgress = !isProgress;
  playButton.classList.toggle("progress", isProgress);
  playIcon.src = isProgress ? "./images/progress.png" : "./images/play.png";
  playIcon.alt = isProgress ? "progress" : "play";
  playButton.setAttribute("data-tooltip", isProgress ? "Stop automated GA4 validation" : "Run automated GA4 validation");

  lockButton.style.pointerEvents = isProgress ? "none" : "auto";
  lockButton.classList.toggle("disabled", isProgress);
}

function toggleLock({ lockButton, lockIcon, playButton }) {
  if (isProgress) return;

  isLock = !isLock;
  lockButton.classList.toggle("lock", isLock);
  lockIcon.src = isLock ? "./images/lock.png" : "./images/open.png";
  lockIcon.alt = isLock ? "lock" : "open";
  lockButton.setAttribute("data-tooltip", isLock ? "Allow page navigation" : "Prevent page navigation");

  playButton.style.pointerEvents = isLock ? "none" : "auto";
  playButton.classList.toggle("disabled", isLock);

  chrome.runtime.sendMessage({ action: isLock ? "lock" : "open" });
}

function clearGA4Data(container) {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.runtime.sendMessage({ action: "clear_tab_data", tabId }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Background 스크립트와 연결되지 않음");
    } else {
      console.log(`탭 ${tabId}의 데이터 삭제 완료`);
    }
  });

  container.innerHTML = "";
}

function toggleModal(open) {
  document.getElementById("modal").classList.toggle("open", open);
}

function saveSortOrder() {
  const eventParams = document.querySelector('textarea[data-event-type="event"]').value.split("\n");
  const userParams = document.querySelector('textarea[data-event-type="user"]').value.split("\n");
  const metricParams = document.querySelector('textarea[data-event-type="metric"]').value.split("\n");
  const ecommerceParams = document.querySelector('textarea[data-event-type="ecommerce"]').value.split("\n");
  const itemParams = document.querySelector('textarea[data-event-type="item"]').value.split("\n");

  const cleanArray = (arr) => arr.filter(Boolean);

  const cleanedSortObj = {
    eventParam: cleanArray(eventParams),
    metricParam: cleanArray(metricParams),
    userParam: cleanArray(userParams),
    ecommerceParam: cleanArray(ecommerceParams),
    itemParam: cleanArray(itemParams),
  };

  chrome.runtime.sendMessage({ action: "setSortOrder", cleanedSortObj });
  console.log("정렬 옵션 저장 완료", cleanedSortObj);
}

function addTooltipListeners(tooltip) {
  document.body.addEventListener("mouseover", (e) => {
    const button = e.target.closest("button[data-tooltip]");
    if (button) {
      tooltip.textContent = button.getAttribute("data-tooltip");
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    }
  });

  document.body.addEventListener("mouseout", () => {
    tooltip.style.display = "none";
  });
}
