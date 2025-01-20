chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("Custom panel created");
});

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");

  const lockButton = document.getElementById("lock-btn");
  const lockIcon = document.getElementById("lock-icon");

  const tooltip = document.getElementById("tooltip");
  const buttons = document.querySelectorAll("button[data-tooltip]");

  let isProgress = false;
  let isLock = false;

  playButton.addEventListener("click", () => {
    if (isLock) {
      return;
    }

    if (isProgress) {
      console.log("Stopping progress...");
      playButton.classList.remove("progress");
      playIcon.src = "./images/play.png";
      playIcon.alt = "play";
      playButton.setAttribute("data-tooltip", "Run automated GA4 validation");
      isProgress = false;
      lockButton.style.pointerEvents = "auto";
      lockButton.classList.remove("disabled");
    } else {
      console.log("Starting progress...");
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
    if (isProgress) {
      return;
    }

    if (isLock) {
      console.log("Open...");
      lockButton.classList.remove("lock");
      lockIcon.src = "./images/open.png";
      lockIcon.alt = "open";
      lockButton.setAttribute("data-tooltip", "Prevent page navigation");
      isLock = false;
      playButton.style.pointerEvents = "auto";
      playButton.classList.remove("disabled");

      chrome.runtime.sendMessage({ action: "open" });
    } else {
      console.log("Lock...");
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

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", (e) => {
      const tooltipText = button.getAttribute("data-tooltip");
      if (tooltipText) {
        tooltip.textContent = tooltipText;
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.display = "block";
      }
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
