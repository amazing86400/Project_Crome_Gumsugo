chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("Custom panel created");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "ga4_event") {
    const ga4Container = document.getElementById("ga4-data-container");
    const { eventType, eventParams, postPayload, url } = message.data;

    const logEntry = document.createElement("div");
    logEntry.innerHTML = `
        <p><strong>Event:</strong> ${eventType}</p>
        <p><strong>Params:</strong> ${eventParams}</p>
        <p><strong>Payload:</strong> ${JSON.stringify(postPayload)}</p>
        <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
        <hr />
    `;

    ga4Container.appendChild(logEntry);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");
  const lockButton = document.getElementById("lock-btn");
  const lockIcon = document.getElementById("lock-icon");
  const clearButton = document.getElementById("clear-btn");
  const tooltip = document.getElementById("tooltip");
  const ga4Container = document.getElementById("ga4-data-container");

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
    ga4Container.innerHTML = "";
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
});
