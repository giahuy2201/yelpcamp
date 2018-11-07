$(document).ready(() => {

    // Stars rating
    // var clicked = false;

    $('#userRating a i').on('mouseover', function () {
        var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on

        // Now higigfa-ht all the stars that's not after the current hovered star
        $(this).parent().parent().children('a').children('i.fa-star').each(function (e) {
            if (e < onStar) {
                $(this).addClass('fas');
                $(this).removeClass('far');
            } else {
                $(this).addClass('far');
                $(this).removeClass('fas');
            }
        });
    }).on('mouseout', function () {
        var url = $(this).parent()["0"].href;
        var stars = $(this).parent().parent().children('a').children('i.fa-star');

        $.ajax({
            url: url,
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                // console.log(data.rate);
                stars.each(function (e) {
                    if (e <= data.rate - 1) {
                        $(this).addClass('fas');
                        $(this).removeClass('far');
                    } else {
                        $(this).addClass('far');
                        $(this).removeClass('fas');
                    }
                });
            }
        })
    });


    /* 2. Action to perform on click */
    $('#userRating a i').on('click', function () {
        var onStar = parseInt($(this).data('value'), 10); // The star currently selected
        var stars = $(this).parent().parent().children('a').children('i.fa-star');

        for (i = 0; i < onStar; i++) {
            $(stars[i]).addClass('fas');
            $(stars[i]).removeClass('far');
        }
        // clicked = true;
    });

    $('#userRating a i').on('click', function (e) {
        e.preventDefault();
        // find the star number
        var onStar = parseInt($(this).data('value'), 10); // The star currently selected
        var url = $(this).parent()["0"].href + "?rating=" + onStar;
        // console.log(url);
        // post this
        $.ajax({
            url: url,
            method: 'POST',
            contentType: 'application/json',
            success: function (data) {
                // $('#ratingAverage').html(data.average);
                // $('#ratingNumber').html(data.number);
                window.location.reload(true);
            }
        })
    })

});