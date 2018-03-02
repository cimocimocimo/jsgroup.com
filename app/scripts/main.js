/*global $, SmoothScroll*/
'use strict';

var jsGroup = (function($, SmoothScroll){

    function newsletterSignupCheckAll(){
        var checkAllCheckboxID = 'newsletter-signup-list-check-all',
            checkAllCheckbox = $('#' + checkAllCheckboxID),
            otherNewsletterCheckboxes = $('input[type=checkbox]').filter('[id!=' + checkAllCheckboxID + ']');

        checkAllCheckbox.change(function(){
            var doCheckAll = checkAllCheckbox.is(':checked');

            if (doCheckAll){
                otherNewsletterCheckboxes.prop('checked', true);
            } else {
                otherNewsletterCheckboxes.prop('checked', false);
            }
        });

        otherNewsletterCheckboxes.change(function(){
            checkAllCheckbox.prop('checked', false);
        });
    }

    function publicInit(){
        newsletterSignupCheckAll();

      var scroll = new SmoothScroll('a[href*="#"]', {
            offset: 16,
            speed: 700
        });

        // site header
        $('.header-main').headroom({
            offset: 78,
            tolerance: 5
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

})($, SmoothScroll);

$(function(){
    jsGroup.init({});
});
