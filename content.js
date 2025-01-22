(() => {
  function blockClicks(event) {
    event.preventDefault();
    // event.stopPropagation();
    console.log("페이지 이동이 방지되었습니다:", event.target.href || event.target.textContent);
  }

  document.addEventListener("click", blockClicks, true);
  console.log("클릭 차단 활성화");
})();
