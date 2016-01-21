var jsGroup = (function($, smoothScroll, window, document, undefined){
    function publicInit(){
        console.log('publicInit');

        smoothScroll.init({
            offset: 16,
            speed: 700
        });

        // site header
        // cache.siteHeader.headroom({
        //     "offset": options.plugins.headroom.offset,
        //     "tolerance": options.plugins.headroom.tolerance
        // });

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

})(jQuery, smoothScroll, window, document);

jQuery(function(){
    jsGroup.init({});
});
