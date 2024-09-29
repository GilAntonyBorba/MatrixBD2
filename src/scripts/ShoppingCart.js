// $(document).ready(function () {
//     $(".card").mouseenter(function (){
//         var $btnShoppingCart = $(this).find(".btn-shopping-cart");

//         $btnShoppingCart.animate({ top: '50.5%' }, 250, function () {
//             $btnShoppingCart.animate({ top: '67.5%' }, 250);
//         });

//         $(this).find(".btn-shopping-cart").removeClass("btn-shopping-cart-show");
//     }).mouseleave(function () {
//         var $btnShoppingCart = $(this).find(".btn-shopping-cart");

//         // Para a animação e redefine a posição ao sair
//         $btnShoppingCart.stop().css("top", "67.5%");
//         $(this).find(".btn-shopping-cart").addClass("btn-shopping-cart-show");
//     });
    
// });

$(document).ready(function () {
    var $cards = $(".card");
    var animationEnabled = true;

    function animateUpDown($element) {
        $element.find(".btn-shopping-cart").animate({ top: '50.5%' }, 250, function () {
            $element.find(".btn-shopping-cart").animate({ top: '67.5%' }, 250);
        });
        $element.find(".btn-shopping-cart").removeClass("btn-shopping-cart-show");
    }

    $cards.mouseenter(function () {
        if (animationEnabled) {
            animateUpDown($(this));
        }
    }).mouseleave(function () {
        if (animationEnabled) {
            var $btnShoppingCart = $(this).find(".btn-shopping-cart");
            $btnShoppingCart.stop().css("top", "67.5%");
            $(this).find(".btn-shopping-cart").addClass("btn-shopping-cart-show");
        }
    });

    function checkBreakpoints() {
        var windowWidth = $(window).width();

        if (windowWidth <= 1024) {
            $(".btn-shopping-cart").removeClass("btn-shopping-cart-show");
            animationEnabled = false;
        } else {
            animationEnabled = true;
        }
    }

    checkBreakpoints();

    $(window).resize(checkBreakpoints);
});
