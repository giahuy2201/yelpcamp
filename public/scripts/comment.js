$(document).ready(function () {

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
                    window.location.reload(true); // refresh so that user can see the message
                    $('html,body').scrollTop(0);
                }
                console.log(data);
            }
        });
    });
})