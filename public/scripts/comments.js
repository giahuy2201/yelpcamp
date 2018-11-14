$(document).ready(function () {

    // when one clicks add coment
    $('#addCommentButton').click(function (e) {
        e.preventDefault();
        $.ajax({ // ask for the newForm
            url: this.href,
            contentType: 'application/json',
            success: function (data) {
                if (data.isLoggedIn) {
                    $('#newForm').html(data.form);
                } else {
                    // click the login button
                    $('a[href="/login"]')[0].click();
                }
            }
        });
    });

    // when the edit button is clicked
    $('.modifyButton a').click(function (e) {
        e.preventDefault();
        var id = $(this).attr('id');
        $.ajax({ // ask for the editForm
            url: this.href,
            contentType: 'application/json',
            success: function (data) {
                if (data.isLoggedIn) {
                    $('#m_' + id).html(data.form);
                } else {
                    // click the login button
                    $('a[href="/login"]')[0].click();
                }
            }
        });
    });
})