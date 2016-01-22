/*global $, smoothScroll*/
'use strict';

var jsGroup = (function($, smoothScroll){
    function publicInit(){
        console.log('publicInit');

        smoothScroll.init({
            offset: 16,
            speed: 700
        });

        // site header
        $('.header-main').headroom({
            "offset": 78,
            "tolerance": 5
        });

        // carousel
        $('#carousel-main').slick({
            prevArrow: '<a href="#" class="slick-prev"></a>',
            nextArrow: '<a href="#" class="slick-next"></a>',
            autoplay: true,
            fade: true,
            autoplaySpeed: 3500,
            speed: 1500
        });

    }

    return {
        init: publicInit
    };

})($, smoothScroll);

$(function(){
    jsGroup.init({});
});
