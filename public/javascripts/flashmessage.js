setTimeout(() => {
  const flashes = document.querySelectorAll(".flash-message"); // get all flash messages
  flashes.forEach(flash => {
    flash.style.transition = "opacity 0.5s ease";
    flash.style.opacity = "0";

    setTimeout(() => flash.remove(), 500); // remove after fade-out
  });
}, 2000); // 2-second delay before fade
