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

});