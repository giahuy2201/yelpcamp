$(document).ready(() => {
    var clicked = false;

    $('#userRating i').on('mouseover', function () {
        var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on

        // Now higigfa-ht all the stars that's not after the current hovered star
        $(this).parent().children('i.fa-star').each(function (e) {
            if (e < onStar) {
                $(this).addClass('fas');
                $(this).removeClass('far');
            } else {
                $(this).addClass('far');
                $(this).removeClass('fas');
            }
        });
        clicked = false;

    }).on('mouseout', function () {
        $(this).parent().children('i.fa-star').each(function (e) {
            if (!clicked) {
                $(this).addClass('far');
                $(this).removeClass('fas');
            }
        });
    });


    /* 2. Action to perform on click */
    $('#userRating i').on('click', function () {
        var onStar = parseInt($(this).data('value'), 10); // The star currently selected
        var stars = $(this).parent().children('i.fa-star');

        for (i = 0; i < onStar; i++) {
            $(stars[i]).addClass('fas');
            $(stars[i]).removeClass('far');
        }
        clicked = true;
    });
});