chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message.action) return;

  switch (message.action) {
    case "extract_lock":
      document.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
        },
        true
      );
      break;

    case "extract_gtm":
      const scripts = Array.from(document.scripts);
      const gtmScripts = scripts.filter((script) => script.src.includes("gtm.js"));

      const gtmIds = gtmScripts.map((script) => {
        const match = script.src.match(/GTM-[\w\d]+/);
        return match ? match[0] : "Unknown ID";
      });

      chrome.runtime.sendMessage({ action: "send_gtm_ids", data: gtmIds });
      break;
  }
});
