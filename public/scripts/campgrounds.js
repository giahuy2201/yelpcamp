$(document).ready(function () {

    var loggedIn = false;

    function showAlert(message) {
        $('#errorAlert').removeClass('d-none');
        $('#errorAlert').addClass('d-block');

        $('#errorAlert').text(message);
    }

    $('#addCampgroundButton').on('click', function (e) {
        if (!loggedIn) {
            e.preventDefault();
            var url = this.href;
            $.ajax({
                url: url,
                method: 'GET',
                contentType: 'application/json',
                success: function (data) {
                    if (data.isLoggedIn) {
                        loggedIn = true;
                        $('#addCampgroundButton')[0].click(); // IMPORTANT
                    } else {
                        showAlert('You need to be logged in to do that!!!');
                        $('html,body').scrollTop(0);
                    }
                    console.log(data);
                }
            });
        }
    });
    $('#logoutButton').on('click', function (e) {
        loggedIn = false;
    });
})