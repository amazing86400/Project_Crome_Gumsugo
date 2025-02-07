chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("Custom panel created");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "ga4_event") {
    const ga4Container = document.getElementById("ga4-data-container");

    message.data.forEach((event) => {
      const logEntry = document.createElement("div");
      logEntry.classList.add("data-wrap", "view");
      logEntry.setAttribute('data-account', event.tid);

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
      ga4Container.appendChild(logEntry);

      event.ep.forEach(({ key, value }) => {
        if (value) {
          logEntry.insertAdjacentHTML('beforeend', `<p><strong>${key}:</strong> ${value}</p>`)
        }
      });

      event.epn.forEach(({ key, value }) => {
        if (value) {
          logEntry.insertAdjacentHTML('beforeend', `<p><strong>${key}:</strong> ${value}</p>`)
        }
      });

      event.eco.forEach(({ key, value }) => {
        if (value) {
          logEntry.insertAdjacentHTML('beforeend', `<p><strong>${key}:</strong> ${value}</p>`)
        }
      });

      Object.keys(event)
        .filter((key) => key.startsWith("pr"))
        .forEach((key) => {
          if (Array.isArray(event[key])) {
            event[key].forEach(({ key: prKey, value }) => {
              if (value) {
                logEntry.insertAdjacentHTML('beforeend', `<p><strong>${key} - ${prKey}:</strong> ${value}</p>`)
              }
            });
          }
        });

      event.up.forEach(({ key, value }) => {
        if (value) {
          logEntry.insertAdjacentHTML('beforeend', `<p><strong>${key}:</strong> ${value}</p>`)
        }
      });
      logEntry.insertAdjacentHTML('beforeend', `<hr />`)

    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");
  const lockButton = document.getElementById("lock-btn");
  const lockIcon = document.getElementById("lock-icon");
  const clearButton = document.getElementById("clear-btn");
  const filterButton = document.getElementById("filter-btn");
  const sortButton = document.getElementById("sort-btn");
  const modalOverlay = document.querySelector(".modal-overlay");
  const tooltip = document.getElementById("tooltip");
  const ga4Container = document.getElementById("ga4-data-container");
  const sortSave = document.getElementById('sort-save');

  let isProgress = false;
  let isLock = false;

  playButton.addEventListener("click", () => {
    if (isLock) return;

    if (isProgress) {
      playButton.classList.remove("progress");
      playIcon.src = "./images/play.png";
      playIcon.alt = "play";
      playButton.setAttribute("data-tooltip", "Run automated GA4 validation");
      isProgress = false;
      lockButton.style.pointerEvents = "auto";
      lockButton.classList.remove("disabled");
    } else {
      playButton.classList.add("progress");
      playIcon.src = "./images/progress.png";
      playIcon.alt = "progress";
      playButton.setAttribute("data-tooltip", "Stop automated GA4 validation");
      isProgress = true;
      lockButton.style.pointerEvents = "none";
      lockButton.classList.add("disabled");
    }
  });

  lockButton.addEventListener("click", () => {
    if (isProgress) return;

    if (isLock) {
      lockButton.classList.remove("lock");
      lockIcon.src = "./images/open.png";
      lockIcon.alt = "open";
      lockButton.setAttribute("data-tooltip", "Prevent page navigation");
      isLock = false;
      playButton.style.pointerEvents = "auto";
      playButton.classList.remove("disabled");

      chrome.runtime.sendMessage({ action: "open" });
    } else {
      lockButton.classList.add("lock");
      lockIcon.src = "./images/lock.png";
      lockIcon.alt = "lock";
      lockButton.setAttribute("data-tooltip", "Allow page navigation");
      isLock = true;
      playButton.style.pointerEvents = "none";
      playButton.classList.add("disabled");

      chrome.runtime.sendMessage({ action: "lock" });
    }
  });

  clearButton.addEventListener("click", () => {
    window.extractedData = [];
    ga4Container.innerHTML = "";
  });

  filterButton.addEventListener("click", () => {

  });

  sortButton.addEventListener("click", () => {
    document.getElementById('modal').classList.add('open');
  });

  modalOverlay.addEventListener("click", () => {
    document.getElementById('modal').classList.remove('open');
  });

  document.querySelectorAll("button[data-tooltip]").forEach((button) => {
    button.addEventListener("mouseenter", (e) => {
      tooltip.textContent = button.getAttribute("data-tooltip");
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    });

    button.addEventListener("mousemove", (e) => {
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
    });

    button.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });

  sortSave.addEventListener('click', () => {
    const eventParams = document.querySelector('textarea[data-event-type="event"]').value.split('\n');
    const userParams = document.querySelector('textarea[data-event-type="user"]').value.split('\n');
    const metricParams = document.querySelector('textarea[data-event-type="metric"]').value.split('\n');
    const ecommerceParams = document.querySelector('textarea[data-event-type="ecommerce"]').value.split('\n');
    const itemParams = document.querySelector('textarea[data-event-type="item"]').value.split('\n');
    const sortObj = {
      eventParam: eventParams,
      metricParam: metricParams,
      userParam: userParams,
      ecommerceParam: ecommerceParams,
      itemParam: itemParams
    };
    const removeEmptyValues = (arr) => arr.filter(Boolean);
    
    const cleanedSortObj = {
      eventParam: removeEmptyValues(sortObj.eventParam),
      metricParam: removeEmptyValues(sortObj.metricParam),
      userParam: removeEmptyValues(sortObj.userParam),
      ecommerceParam: removeEmptyValues(sortObj.ecommerceParam),
      itemParam: removeEmptyValues(sortObj.itemParam)
    };
    
    chrome.runtime.sendMessage({ action: "setSortOrder", cleanedSortObj });
    console.log('Success');
    console.log(cleanedSortObj);
  })
});