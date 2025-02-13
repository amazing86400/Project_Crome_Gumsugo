(() => {
  document.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      console.log("페이지 이동 방지됨:", event.target.href);
    },
    true
  );
})();
