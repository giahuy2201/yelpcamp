$(document).ready(() => {

    // check password
    $('#passwordInput2').on('input', () => {
        if ($('#passwordInput2').val() == $('#passwordInput').val()) {
            $('#passwordInput2').addClass('matched');
            $('#passwordInput2').removeClass('nmatched');
            $('#passwordInput2').tooltip('dispose');
            $('input[type="submit"]').prop('disabled', false);
        } else {
            $('#passwordInput2').addClass('nmatched');
            $('#passwordInput2').removeClass('matched');
            $('#passwordInput2').tooltip('show');
            $('input[type="submit"]').prop('disabled', true);
        }
    }).on('blur', () => {
        if ($('#passwordInput2').val() == $('#passwordInput').val()) {
            $('#passwordInput2').removeClass('matched');
        }
    })

    // file input
    $('input[type="file"]').on('change', () => {
        if ($('input[type=file]').val()) {
            $('.custom-file-label').text($('input[type=file]').val().split('\\').pop());
        } else {
            $('.custom-file-label').text('Choose photo');
        }
    })

    // check username
    // $('#usernameInput').on('input', () => {
    //     console.log(window.location.origin);
    //     $.ajax({
    //         url: window.location.origin + '/username',
    //         method: 'GET',
    //         contentType: 'application/json',
    //         success: function (user) {
    //             console.log(user);
    //             if (user.exist) {
    //                 $('#usernameInput').addClass('nmatched');
    //                 $('#usernameInput').removeClass('matched');
    //                 $('#usernameInput').tooltip('show');
    //                 $('input[type="submit"]').prop('disabled', true);
    //             } else {
    //                 $('#usernameInput').addClass('matched');
    //                 $('#usernameInput').removeClass('nmatched');
    //                 $('#usernameInput').tooltip('dispose');
    //                 $('input[type="submit"]').prop('disabled', false);
    //             }
    //         }
    //     });
    // });
});