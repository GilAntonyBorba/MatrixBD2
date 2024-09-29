var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    // cssMode: true,
    // mousewheel: true,
    keyboard: true,
  
    autoplay:{
      delay: 2500,
      disableOnInteraction: false,
    },
   
    // pagination: {
    //   el: ".swiper-pagination",
    //   clickable: true,
    // },
  
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
  
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 5
      },
      // when window width is >= 640px
      640: {
        slidesPerView: 2,
        spaceBetween: 10
      },
      790: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      1050: {
        slidesPerView: 4,
        spaceBetween: 30
      },
      1418: {
        slidesPerView: 5,
        spaceBetween: 40
      }
    }
  }); 