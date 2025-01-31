/*
UNDER CONSTRUCTION
*/

$('#delete_provider_button').bind('click', function (event) {
    event.preventDefault();
    if ($('#confirm_delete').css('display') != 'block') {

        var confirmDialog = $APP.UI.Confirm({
            id: "confirm_delete",
            message: "<strong>Are you sure you want to delete this provider?</strong>",
            onConfirm: function () {
                deleteURL = $('#delete_provider_form').attr("action").replace(/ConfirmDelete/, 'Delete');
                $('#delete_provider_form').attr("action", deleteURL);
                $('#delete_provider_form').submit();
            }
        });
        confirmDialog.show();

    }
});


$('#cancel_new_provider_button').bind('click', function (event) {
    event.preventDefault();
    if ($('#confirm_cancel').css('display') != 'block') {

        $APP.UI.Confirm({
            id: "confirm_cancel",
            message: "Are you sure you want to cancel adding a new provider?",
            importance: 'high',
            onConfirm: function () {
                history.go(-1);
            }
        });
    }
});

$('#save_family').bind('click', function (event) {
    event.preventDefault();

    var addressChanged = false;

    addressChanged = (($("#Address1").val() != $("#MailAddress1").val()) || ($("#Address2").val() != $("#MailAddress2").val()) || ($("#City").val() != $("#MailCity").val()) || ($("#State").val() != $("#MailState").val()) || ($("#ZipCode").val() != $("#MailZipCode").val())) ? true : false;

    if (addressChanged == true) {
        $APP.UI.Confirm({
            id: "confirm_copy_address",
            message: "Would you like to copy the main address to the mailing address?",
            importance: 'high',
            onConfirm: function () {
                $('.main_address_field').each(function (index) {
                    $('#Mail' + this.id).val($(this).val());
                });
                addressChanged = false;
                $('#case_information_form').submit();
            },
            onCancel: function () {
                addressChanged = false;
                $('#case_information_form').submit();
            }
        });
    } else {
        $('#case_information_form').submit();
    }
});

$("#copyMainAddress").bind('click', function (event) {
    event.preventDefault();
    $('.main_address_field').each(function (index) {
        $('#Mail' + this.id).val($(this).val());
    });
});
//Override search link behavior
$('#show_provider_search').click(function (event) {
    event.preventDefault();
    showProviderSearchForm('provider_search', 'Provider Search');
});

//Get provider search selection
function returnProviderSearchSelection(providerID) {
    window.location.href = '../../Provider/Show/' + providerID;

    $('#provider_search').hide();
    $APP.UI.Lightbox.hide();
}

//Cancel provider search - close search form
function cancelProviderSearch() {
    $('#provider_search').hide();
    $APP.UI.Lightbox.hide();
}

//Unsaved data warning message

if ($("#UnsavedDataWarning").val() == 1) {

    $(window).bind('beforeunload', function () {

        if (sessionStorage.getItem('isDirty') == "true") {
            return 'Continue without Saving?';
        }
    });

    $(window).unload(function () {
        sessionStorage.setItem('isDirty', false);
    });
}