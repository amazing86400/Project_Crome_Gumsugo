let isProgress = false;
let isLock = false;

chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("GubGub DevTools 패널이 생성됨");
});

const port = chrome.runtime.connect({ name: "devtools" });

port.onDisconnect.addListener(() => {
  console.warn("DevTools 패널이 닫혔으므로 메시지 전송을 중단합니다.");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== "ga4_event" || message.tabId !== chrome.devtools.inspectedWindow.tabId) return;

  const ga4Container = document.getElementById("ga4-data-container");
  const event = message.data;

  const logEntry = document.createElement("div");
  logEntry.classList.add("data-wrap", "view");
  logEntry.setAttribute("data-account", event.tid);

  logEntry.innerHTML = `
          <p><strong>Property ID:</strong> ${event.tid}</p>
          <p><strong>Timestamp:</strong> ${event._p}</p>
          <p><strong>Client ID:</strong> ${event.cid}</p>
          <p><strong>Session ID:</strong> ${event.sid}</p>
          <p><strong>Page URL:</strong> ${event.dl}</p>
          <p><strong>Referrer:</strong> ${event.dr}</p>
          <p><strong>Page Title:</strong> ${event.dt}</p>
          <p><strong>Event Name:</strong> ${event.en}</p>
      `;
  appendEventData(logEntry, event.ep);
  appendEventData(logEntry, event.epn);
  appendEventData(logEntry, event.eco);
  appendProductData(logEntry, event);
  appendEventData(logEntry, event.up);

  ga4Container.appendChild(logEntry);
});

function appendEventData(container, data) {
  data?.forEach(({ key, value }) => {
    if (value) {
      container.insertAdjacentHTML("beforeend", `<p><strong>${key}:</strong> ${value}</p>`);
    }
  });
}

function appendProductData(container, event) {
  Object.keys(event)
    .filter((key) => key.startsWith("pr"))
    .forEach((key) => {
      event[key]?.forEach(({ key: prKey, value }) => {
        if (value) {
          container.insertAdjacentHTML("beforeend", `<p><strong>${key} - ${prKey}:</strong> ${value}</p>`);
        }
      });
    });
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
      console.warn("Background 스크립트와 연결되지 않음");
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
