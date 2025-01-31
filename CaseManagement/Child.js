
$('#delete_child_button').bind('click', function(event) {
    event.preventDefault();
    if ($('#confirm_delete').css('display') != 'block') {
        
        var confirmDialog = $APP.UI.Confirm({
            id: "confirm_delete",
            message: "<strong>Are you sure you want to delete this child?</strong>",
            onConfirm: function () {
                deleteURL = $('#delete_child_form').attr("action").replace(/ConfirmDelete/, 'Delete');
                $('#delete_child_form').attr("action", deleteURL);
                $('#delete_child_form').submit();
            }
        });
        confirmDialog.show();

        /*
        ui.showConfirm({
            id: "confirm_delete",
            message: "<strong>Are you sure you want to delete this child?</strong>",
            lightbox: true,
            yesIcon: assets.images + 'icons/del_16.png',
            yesImportance: 'high',
            noIcon: assets.images + 'icons/opnbr_16.png',
            onConfirm: function() {
                deleteURL = $('#delete_child_form').attr("action").replace(/ConfirmDelete/, 'Delete');
                $('#delete_child_form').attr("action", deleteURL);
                $('#delete_child_form').submit();
            }
        });
        */
    }
});

$('#cancel_add').bind('click', function (event) {

    event.preventDefault();
    $APP.UI.Confirm({
        id: "confirm_cancel",
        message: "Are you sure you want to cancel adding a new child?",
        importance: 'high',
        onConfirm: function () {
            history.go(-1);
        }
    });
});

// Open child search form
$('#show_family_search').click(function (event) {
    event.preventDefault();
    showFamilySearchForm('family_search', 'Family Search');
});

function returnFamilySearchSelection(familyID) {
    $('#FamilyID').val(familyID);
    cancelFamilySearch();
    $.get($('#FamilyID').data('url').replace("familyId", familyID), function (data) {
        $('#familyName').html(data.name);
    });
}

function cancelFamilySearch() {
    $('#family_search').hide();
    $APP.UI.Lightbox.hide();
}

//Override search link behavior
$('#show_child_search').bind('click', function (event) {
    event.preventDefault();

    showChildSearchForm('child_search', 'Child Search');
});

//Get search selection
function returnChildSearchSelection(childID) {
    window.location.href = '../../Child/Show/' + childID;

    $('#child_search').hide();
    $APP.UI.Lightbox.hide();
}

//Cancel search - close search form
function cancelChildSearch() {
    $('#child_search').hide();
    $APP.UI.Lightbox.hide();
}

//function returnProviderSearchSelection(providerID) {
//    $('#ProviderID').val(providerID);
//    //getProviderName(providerID)
//    $('#provider_search').remove();
//    $APP.UI.Lightbox.hide();
//}

//$('#show_provider_search').bind('click', function (event) {
//    event.preventDefault();
//    showProviderSearchForm('provider_search', 'Provider Search');
//});

//function cancelProviderSearch() {
//    $('#provider_search').remove();
//    $APP.UI.Lightbox.hide();
//}

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