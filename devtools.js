chrome.devtools.panels.create("GubGub", "", "devtools.html", function (panel) {
  console.log("Custom panel created");
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-btn");
  let isStarted = false; // 상태 플래그: false(Stop 상태), true(Start 상태)

  // 버튼 클릭 이벤트
  toggleButton.addEventListener("click", () => {
    if (isStarted) {
      // End 상태로 변경
      console.log("End 상태");
      toggleButton.textContent = "Start";
      isStarted = false;

      // End 동작 수행
      chrome.runtime.sendMessage({ action: "end" });
    } else {
      // Start 상태로 변경
      console.log("Start 상태");
      toggleButton.textContent = "End";
      isStarted = true;

      // Start 동작 수행
      chrome.runtime.sendMessage({ action: "start" });
    }
  });
});
