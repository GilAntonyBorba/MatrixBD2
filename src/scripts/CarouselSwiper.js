var swiper = new Swiper(".mySwiperCar", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  keyboard: true,

  autoplay:{
    delay: 10000,
    disableOnInteraction: false,
  },

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  // navigation: {
  //   nextEl: ".swiper-button-next",
  //   prevEl: ".swiper-button-prev",
  // },
});
