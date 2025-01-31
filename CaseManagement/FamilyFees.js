
$(document).ready(function () {

    $('.edit_income_button').bind('click', function (event) {
        event.preventDefault();

        $.get($(this).data('url'), function (data) {
            ui.showDialog({
                id: 'incomefee_detail_dialog',
                title: 'Income Fee Detail',
                titleColor: 'blue',
                width: '80%',
                lightbox: true,
                iconURL: assets.images + 'icons/edit_16.png',
                content: data,
                shadow: true
            });
            registerIncomeFeeElements();
        });
    });

    $('.remove_income_button').bind('click', function (event) {
        event.preventDefault();
        alert($(this).data('url'));
    });
});


var registerIncomeFeeElements = function () {

    forms.registerFormatHandlers();
    forms.registerUndoButton();
    $('.cancel_button').bind('click', function (event) {
        event.preventDefault();
        $('#incomefee_detail_dialog').remove();
        ui.hideLightbox();
    });

}

