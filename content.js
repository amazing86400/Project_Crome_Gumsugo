(() => {
  function blockClicks(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("페이지 이동이 방지되었습니다:", event.target.href || event.target.textContent);
  }

  document.addEventListener("click", blockClicks, true);
  console.log("클릭 차단 활성화");

  function interceptGA4Events() {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      if (args[0].includes("google-analytics.com")) {
        console.log("GA4 이벤트 감지 (Fetch):", args);
      }
      return originalFetch.apply(this, args);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      if (url.includes("google-analytics.com")) {
        console.log("GA4 이벤트 감지 (XHR):", method, url);
      }
      originalXHROpen.apply(this, [method, url, ...rest]);
    };
  }
})();
