$(document).ready(function () {

    function showAlert(message) {
        $('#errorAlert').removeClass('d-none');
        $('#errorAlert').addClass('d-block');

        $('#errorAlert').text(message);
    }

    $('#addCommentButton').click(function (e) {
        e.preventDefault();
        var url = this.href;
        $.ajax({
            url: url,
            method: 'GET',
            contentType: 'application/json',
            success: function (data) {
                if (data.isLoggedIn) {
                    $('#newForm').toggleClass('d-none');
                } else {
                    showAlert('You need to be logged in to do that!!!');
                    $('html,body').scrollTop(0);
                }
                console.log(data);
            }
        });
    });
})