$(document).find('#form_content').hide().slideDown("slow");

$('#delete_family_button').bind('click', function (event) {
        event.preventDefault();
        if ($('#confirm_delete').css('display') != 'block') {
            var confirmDialog = $APP.UI.Confirm({
                id: "confirm_delete",
                message: "<strong>Are you sure you want to delete this family?</strong>",
                onConfirm: function () {
                    deleteURL = $('#delete_family_form').attr("action").replace(/ConfirmDelete/, 'Delete');
                    $('#delete_family_form').attr("action", deleteURL);
                    $('#delete_family_form').submit();
                }
            });
            confirmDialog.show();
        }
    });

    $('#cancel_add').bind('click', function (event) {
        event.preventDefault();
        $APP.UI.Confirm({
            id: "confirm_cancel",
            message: "Are you sure you want to cancel adding a new family?",
            importance: 'high',
            onConfirm: function () {
                history.go(-1);
            }
        });
    });


    //Override search link behavior
    $('#show_family_search').bind('click', function (event) {
        event.preventDefault();

        showFamilySearchForm('family_search', 'Family Search');
    });

    //Get search selection
    function returnFamilySearchSelection(familyID) {

        var redirectAction = ($("#ShowDashboard").val() == 'False') ? "Show" : "Dashboard";
        window.location.href = '../../Family/' + redirectAction + '/' + familyID;


        $('#family_search').hide();
        $APP.UI.Lightbox.hide();
    }

    //Cancel search - close search form
    function cancelFamilySearch() {
        $('#family_search').hide();
        $APP.UI.Lightbox.hide();
    }


    var validatePrimaryAndSecondarySSNs = function (element, message) {

        var targetForm = $APP.Forms.findParent(element);
        var oppsiteSSN = (element.id == 'PrimarySSN') ? $('#SecondarySSN').get(0) : element;
        var displayMessage = message;

        if (targetForm) {
            if (element.value != '') {
                if ($('#PrimarySSN').val() == $('#SecondarySSN').val()) {
                    targetForm.addError(element, displayMessage, "client");
                } else {
                    targetForm.correctError(element, displayMessage);

                    targetForm.correctError(oppsiteSSN, displayMessage);
                }
            } else {
                targetForm.correctError(element, displayMessage);

                targetForm.correctError(oppsiteSSN, displayMessage);
            }
        }
    }

    $APP.Forms.Validation.ValidatePrimaryAgainstSecondarySSNField = validatePrimaryAndSecondarySSNs;
    $APP.Forms.Validation.ValidateSecondaryAgainstPrimarySSNField = validatePrimaryAndSecondarySSNs;


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