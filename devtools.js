chrome.devtools.panels.create("GA4 Inspector", "", "devtools.html", function (panel) {
  console.log("Custom panel created");
});

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-btn");
  const endButton = document.getElementById("end-btn");

  // Start 버튼 클릭 이벤트
  startButton.addEventListener("click", () => {
    console.log("Start 버튼 클릭됨");
    chrome.runtime.sendMessage({ action: "start" });
  });

  // End 버튼 클릭 이벤트
  endButton.addEventListener("click", () => {
    console.log("End 버튼 클릭됨");
    chrome.runtime.sendMessage({ action: "end" });
  });
});
