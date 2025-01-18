chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("Custom panel created");
});

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");
  const tooltip = document.getElementById("tooltip");
  const buttons = document.querySelectorAll("button[data-tooltip]");
  let isProgress = false;

  playButton.addEventListener("click", () => {
    if (isProgress) {
      console.log("Stopping progress...");
      playButton.classList.remove("progress");
      playIcon.src = "./images/play.png";
      playIcon.alt = "play";
      playButton.setAttribute("data-tooltip", "Prevent page navigation");
      isProgress = false;

      chrome.runtime.sendMessage({ action: "stop" });
    } else {
      console.log("Starting progress...");
      playButton.classList.add("progress");
      playIcon.src = "./images/progress.png";
      playIcon.alt = "progress";
      playButton.setAttribute("data-tooltip", "Allow page navigation");
      isProgress = true;

      chrome.runtime.sendMessage({ action: "play" });
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
