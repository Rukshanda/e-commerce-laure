


document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animation only when entering viewport
          entry.target.classList.remove("opacity-0");
          entry.target.classList.add(
            "animate__animated",
            "animate__backInLeft"
          );

          // Restart animation each time by forcing reflow
          entry.target.addEventListener(
            "animationend",
            () => {
              entry.target.classList.remove(
                "animate__animated",
                "animate__backInLeft"
              );
            },
            { once: true }
          );
        } else {
          // When leaving viewport, reset so it can play again
        }
      });
    },
    { threshold: 0.5 }
  );

  cards.forEach((card) => observer.observe(card));
});




  const swiper = new Swiper(".mySwiper", {
      modules: [],
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      speed: 1200,
      loop: true,
      spaceBetween: 60,
      breakpoints: {
        1280: { slidesPerView: 3 },
        768: { slidesPerView: 2 },
        450: { slidesPerView: 1 },
        0: { slidesPerView: 1 },
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });









document.addEventListener("DOMContentLoaded", () => {
  const galleryCards = document.querySelectorAll(".gallery-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animation only when entering viewport
          entry.target.classList.remove("opacity-0");
          entry.target.classList.add(
            "animate__animated",
            "animate__pulse"
          );

          // Restart animation each time by forcing reflow
          entry.target.addEventListener(
            "animationend",
            () => {
              entry.target.classList.remove(
                "animate__animated",
                "animate__pulse"
              );
            },
            { once: true }
          );
        } else {
          // When leaving viewport, reset so it can play again
        }
      });
    },
    { threshold: 0.5 }
  );

  galleryCards.forEach((card) => observer.observe(card));
});


