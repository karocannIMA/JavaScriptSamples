var strTemplates = [[]];

function Initialize() {
    var currentTime = new Date()
    var month = currentTime.getMonth() + 1
    var day = currentTime.getDate()
    var year = currentTime.getFullYear()

    var displaydate = month + "/" + day + "/" + year;
    $('#NOADate').val(displaydate);
}


function chkAction() {
    //1 InitialApproval, 2 Denied , 3 Determination, 4 Recertification, 5 PaymentChange, 6 Change, 7 Terminated, 8 DelinquentFee, 9 Referral, 10 Ineligibility
    if ($('form #InitialApproval').is(":checked"))
        strAction = 1
    else if ($('form #Denied').is(":checked"))
        strAction = 2
    else if ($('form #Determination').is(":checked"))
        strAction = 3
    else if ($('form #Recertification').is(":checked"))
        strAction = 4
    else if ($('form #PaymentChange').is(":checked"))
        strAction = 5
    else if ($('form #Change').is(":checked"))
        strAction = 6
    else if ($('form #Terminated').is(":checked"))
        strAction = 7
    else if ($('form #DelinquentFee').is(":checked"))
        strAction = 8
    else if ($('form #Referral').is(":checked"))
        strAction = 9
    else if ($('form #Ineligibility').is(":checked"))
        strAction = 10
    else
        strAction = 0;
    return strAction;
}

function chkType() {
    //1 CDE, 2 DPSS
    if ($('#ReportFormat option:selected').val() == "1")  //CDE
    {
        $('#CopyTo').val("0");
        $('#CopyTo').attr("disabled", "disabled");

        $('#Determination').attr("disabled", "disabled");
        $('#PaymentChange').attr("disabled", "disabled");
        $('#Referral').attr("disabled", "disabled");
        $('#Ineligibility').attr("disabled", "disabled");

        $('#FamilyNOARequiredDocuments').attr("disabled", "disabled");


    }
    else if ($('#ReportFormat option:selected').val() == "2")  //DPSS
    {
        $('#CopyTo').removeAttr("disabled");
        $('#Determination').removeAttr("disabled");
        $('#PaymentChange').removeAttr("disabled");
        $('#Referral').removeAttr("disabled");
        $('#Ineligibility').removeAttr("disabled");
        $('#FamilyNOARequiredDocuments').removeAttr("disabled");

        DPSS(chkAction());
    }
    else
        $('#CopyTo').val("2");

}


function DisabledEffect() {
    $('#add_entity_dialog').css('z-index', 90);
}

function DPSS(strAction) {
    alert(strAction);
    DisabledEffect();
    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/DPSS',
        type: "post",
        data: "ID=" + "<%= Model.ID %>&" + "NOAAction=" + strAction,
        global: false,
        asysn: false,
        cache: false,
        success: function (data) {

            var DPSSDialog = new $APP.UI.Dialog({
                id: 'DPSS_dialog',
                title: 'Family NOA',
                titleColor: 'blue',
                width: '66%',
                lightbox: true,
                iconURL: assets.images + 'icons/edit_16.png',
                content: data,
                shadow: true,
                zindex: '9999'
            });

            DPSSDialog.show();

        }
    });
}


function validateForm() {
    if ($('#NOADate').val().length == 0) {
        alert("NOA Date is required!");
        return false
    }
    return true;
}


function refreshListing() {


    if ($('#SelectDocuments').val() != '')
        displayDocumentSelector();
    if ($('#DisplayActionForm').val() != '')
        displayActionForm($('#SelectedActionName').val(), $("#DPSSFormatID").val(), $("#CDEFormatID").val(), false);
    if ($('#SelectChildren').val() != '')
        selectChildren();
    if ($('#SelectSchedule').val() != '')
        selectScheudle();
    var parentList = $APP.UI.EditableLists.find('family_NOA_list');
    $('#submit_preview_button').css('opacity', '');
    $("#id_submit_preview_button").removeAttr("disabled");
    $('#save_NOA_button').css('opacity', '');
    $("#id_save_NOA_button").removeAttr("disabled");

    // requeryNOATemplate();

    parentList.refreshList();

}

var checkReminderORCaseNoteGeneration = function (noaId) {

    if ($("#GenerateReminderAtRequestForDoc").val() != 0 || $("#GenerateCaseNotesAtRequestForDoc").val() != 0) {
        if ($("#GenerateReminderAtRequestForDoc").val() == 1) {
            var confirmDialog = $APP.UI.Confirm({
                id: "confirm_reminder_generation",
                message: "Would you like to generate a reminder entry for this request for documentation?",
                onConfirm: function () {
                    GenerateReminderOrCaseNote(noaId, 1)
                },
                onCancel: function () {
                    $("#NOA_form").submit();
                }
            });
            confirmDialog.show();
        }

        if ($("#GenerateCaseNotesAtRequestForDoc").val() == 1) {
            var confirmDialog = $APP.UI.Confirm({
                id: "confirm_casenotes_generation",
                message: "Would you like to generate a Case Note entry for this request for documentation?",
                onConfirm: function () {
                    GenerateReminderOrCaseNote(noaId, 2)
                },
                onCancel: function () {
                    $("#NOA_form").submit();
                }
            });
            confirmDialog.show();
        }
    } else {
        $("#NOA_form").submit();
    }

}

var GenerateReminderOrCaseNote = function (noaID, generationTypeID) {
    //genrationTypeID: flag passed to controller to indicate whether we want to generate 
    //Reminder (1) or case notes (2)

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/GenerateReminder_CaseNotesAtRequestForDoc/',
        data: 'NOAID=' + noaID + '&GenerationTypeID=' + generationTypeID,
        cache: false,
        success: function (data) {
            $("#NOA_form").submit();
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

        }
    });

}

var CopyScheduleMemoTextToHoursText = function () {

    if ($('#ViewMode').val() == "Add") {
        var familyID = $('#FamilyID').val();
        var effectiveDate = $APP.Forms.Formats.formatDate($('#EffectiveDate').val());

        $.ajax({
            url: root + 'CaseManagement/FamilyNOA/CopyScheduleMemoTextToHoursText/',
            data: 'FamilyID=' + familyID + '&EffectiveDate=' + effectiveDate,
            cache: false,
            success: function (data) {
                $('#HoursText').html(data.MemoText);
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

            }
        });
    }
}

var displayDocumentSelector = function () {

    if ($('#FamilyNOAID').val() != 0 || $("#CalledFrom").val() == "FamilyRecertification") {

        var languageID = 2

        if ($("#CalledFrom").val() == "FamilyRecertification")
            languageID = $("#Language").val();
        else
            languageID = ($("#DocumentLanguageID option:selected").text().toLowerCase() == "spanish" ? 1 : 0);

        $.ajax({
            url: root + 'CaseManagement/FamilyNOA/RequiredDocumentSelector/',
            data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val() + "&languageID=" + languageID,
            cache: false,
            success: function (data) {
                var documentSelectorUIRef = new $APP.UI.Dialog({
                    id: 'requiredDocumentSelector',
                    title: 'Select Required Documents',
                    titleColor: 'green',
                    width: '66%',
                    lightbox: true,
                    iconURL: assets.images + 'icons/edit_16.png',
                    content: data,
                    shadow: true
                });
                documentSelectorUIRef.show();
                $('#SelectDocuments').val('');
                $APP.UI.hideLoading($('#NOA_form'));
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

            }
        });
    }
};
var displayProviderDocumentSelector = function () {

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/ProviderDocumentSelector/',
        data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val(),
        cache: false,
        success: function (data) {
            var documentSelectorUIRef = new $APP.UI.Dialog({
                id: 'providerDocumentSelector',
                title: 'Select Provider Documents',
                titleColor: 'green',
                width: '66%',
                lightbox: true,
                iconURL: assets.images + 'icons/edit_16.png',
                content: data,
                shadow: true
            });
            documentSelectorUIRef.show();
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

        }
    });

};
var displayParticipantDocumentSelector = function () {

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/ParticipantDocumentSelector/',
        data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val(),
        cache: false,
        success: function (data) {
            var documentSelectorUIRef = new $APP.UI.Dialog({
                id: 'participantDocumentSelector',
                title: 'Select Participant Documents',
                titleColor: 'green',
                width: '66%',
                lightbox: true,
                iconURL: assets.images + 'icons/edit_16.png',
                content: data,
                shadow: true
            });
            documentSelectorUIRef.show();
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

        }
    });
};
// List requerying function
function requeryList(listSelector, newListData) {
    var selectedOption = "0";
    var select = listSelector;
    var options;
    if (select.prop) {
        options = select.prop('options');
    }
    else {
        options = select.attr('options');
    }

    $('option', select).remove();
    options[0] = new Option("", "0");

    $.each(newListData, function (val, text) {
        if (text != null)
            options[options.length] = new Option(text.length > 100 ? text.substring(0, 100 - 3) + '...' : text, val);
    });
    select.val(selectedOption);
}

function requeryRequiredDocuments() {

    var languageID = ($("#DocumentLanguageID option:selected").text().toLowerCase() == "spanish" ? 1 : 0);

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/RequiredDocuments/',
        data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val()+"&languageID="+languageID,
        cache: false,
        success: function (data) {
            requeryList($('#FamilyNOARequiredDocuments'), data.docs);
        }
    });
}

function requery_DPSS_CCRC_Documents(docType) {
    //0 = provider doc selected and 1 = participantDoc selected from ST1-10A
    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/DPSS_CCRC_Documents/',
        data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val() + "&docType=" + docType,
        cache: false,
        success: function (data) {
            if (docType == 0)
                requeryList($('#ProviderOtherList'), data.docs);
            else
                requeryList($('#ParticipantOtherList'), data.docs);
        }
    });
}

function setupForDPSSFormat_Consortium() {
    $("#Determination").attr("disabled", true);
    $("#AppealDate").attr("disabled", true);
    $("#Recertification").attr("disabled", true);
    $("#DelinquentFee").attr("disabled", true);
    $("#Referral").attr("disabled", true);
    $("#Ineligibility").attr("disabled", true);
    $("#ReqRcpt").attr("disabled", true);
    $("#ReqChange").attr("disabled", true);
    $("#Checklist").attr("disabled", true);
    $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
    $("#NOAText2").attr("disabled", true);
    $("#NOAText3").attr("disabled", true);
    $("#OtherText").attr("disabled", true);
    $("#OtherText").css('background-color', 'transparent');
    $("#select_documents").hide();
    $(".ExcludePrivateSchedHoursOpt").show()
}

function setupForDPSSFormat_Default() {

    $("#AppealDate").attr("disabled", true);
    $("#Recertification").attr("disabled", true);
    $("#DelinquentFee").attr("disabled", true);
    $("#Referral").attr("disabled", true);
    $("#Ineligibility").attr("disabled", true);
    $("#ReqRcpt").attr("disabled", true);
    $("#ReqChange").attr("disabled", true);
    $("#Checklist").attr("disabled", true);
    $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
    $("#NOAText2").attr("disabled", true);
    $("#NOAText3").attr("disabled", true);
    $("#OtherText").attr("disabled", true);
    $("#OtherText").css('background-color', 'transparent');
    $("#select_documents").hide();
    $(".ExcludePrivateSchedHoursOpt").show()
}

function setupForProviderNOAStage1Format_Consortium_Default() {
    $("#Determination").attr("disabled", true);
    $("#Recertification").attr("disabled", true);
    $("#Denied").attr("disabled", true);
    $("#PaymentChange").attr("disabled", true);
    $("#DelinquentFee").attr("disabled", true);
    $("#Referral").attr("disabled", true);
    $("#Ineligibility").attr("disabled", true);
    $("#ReqRcpt").attr("disabled", true);
    $("#ReqChange").attr("disabled", true);
    $("#Checklist").attr("disabled", true);
    $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
    $("#NOAText2").attr("disabled", true);
    $("#NOAText3").attr("disabled", true);
    $("#AppealDate").attr("disabled", true);
    $("#select_documents").hide();
    $(".ExcludePrivateSchedHoursOpt").hide()

    if ($('#Change').is(':checked')) {
        $('.TypeOfChangeGroup').css("visibility", "visible");
        $("#TypeOfChangeOther").change()
    }



}

function setupForProviderNOAStage1Format_CHS() {
    $("#Determination").attr("disabled", true);
    $("#Recertification").attr("disabled", true);
    $("#PaymentChange").attr("disabled", true);
    $("#DelinquentFee").attr("disabled", true);
    $("#Referral").attr("disabled", true);
    $("#Ineligibility").attr("disabled", true);
    $("#ReqRcpt").attr("disabled", true);
    $("#ReqChange").attr("disabled", true);
    $("#Checklist").attr("disabled", true);
    $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
    $("#NOAText2").attr("disabled", true);
    $("#NOAText3").attr("disabled", true);
    $("#AppealDate").attr("disabled", true);
    $("#select_documents").hide();
    $(".ExcludePrivateSchedHoursOpt").hide()
    if ($('#Change').is(':checked')) {
        $('.TypeOfChangeGroup').css("visibility", "visible");
        $("#TypeOfChangeOther").change()
    }

}

function setupForProviderNOAStage1Format_CCRC() {
    $("#AppealDate").attr("disabled", true);
    $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
    $("#Determination").attr("disabled", true);
    $("#Recertification").attr("disabled", true);
    $("#PaymentChange").attr("disabled", true);
    $("#DelinquentFee").attr("disabled", true);
    $("#Referral").attr("disabled", true);
    $("#Ineligibility").attr("disabled", true);
    $("#ReqRcpt").attr("disabled", true);
    $("#ReqChange").attr("disabled", true);
    $("#Checklist").attr("disabled", true);
    $("#select_documents").hide();
    $('.reasonForAction').css("visibility", "visible");
    $(".ExcludePrivateSchedHoursOpt").hide()

    if ($('#Change').is(':checked')) {
        $('.TypeOfChangeGroup').css("visibility", "visible");
        $("#TypeOfChangeOther").change()
    }

}

function setupForRequestForDocumentation() {
    $("#AppealDate").attr("disabled", true);
    $("#FirstPageOnly").attr("disabled", true);
    $("#Actions").attr("disabled", true);
    $("#NOAText2").attr("disabled", true);
    $("#NOAText3").attr("disabled", true);
    $("#ActionJustification").attr("disabled", "disabled");
    $("#HoursText").attr("disabled", true);
    $("#OtherText").attr("disabled", true);
    $("#OtherText").css('background-color', 'transparent');
    $("#select_documents").css("visibility", "visible");
    $(".ExcludePrivateSchedHoursOpt").hide()
}

function setupForCDE(CDEFormatID) {

    $("#Determination").attr("disabled", true);
    $("#PaymentChange").attr("disabled", true);
    $("#Referral").attr("disabled", true);
    $("#Ineligibility").attr("disabled", true);
    $("#ReqRcpt").attr("disabled", true);
    $("#ReqChange").attr("disabled", true);
    $("#Checklist").attr("disabled", true);
    $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
    $("#NOAText2").attr("disabled", true);
    $("#NOAText3").attr("disabled", true);
    $("#OtherText").attr("disabled", true);
    $("#OtherText").css('background-color', 'transparent');
    $("#select_documents").hide();
    if (CDEFormatID == "10")
        $('.reasonForAction').css("visibility", "visible");
    if (CDEFormatID == "2") {
        $("#OtherText").removeAttr("disabled");
        $("#OtherText").css('background-color', 'white');
    }
    $(".ExcludePrivateSchedHoursOpt").show()
}

function reEnableFieldsDisabledByNOAType() {
    //Enable all disabled fields
    $("#AppealDate").removeAttr("disabled");
    $("#FirstPageOnly").removeAttr("disabled");
    $("#Actions").removeAttr("disabled");
    $("#NOAText2").removeAttr("disabled");
    $("#NOAText3").removeAttr("disabled");
    $("#ActionJustification").removeAttr("disabled");
    $("#HoursText").removeAttr("disabled");
    $("#OtherText").removeAttr("disabled");
    $("#OtherText").css('background-color', 'white');
    $("#Denied").removeAttr("disabled");
    $("#PaymentChange").removeAttr("disabled");
    $("#Determination").removeAttr("disabled");
    $("#DelinquentFee").removeAttr("disabled");
    $("#Recertification").removeAttr("disabled");
    $("#DelinquentFee").removeAttr("disabled");
    $("#Referral").removeAttr("disabled");
    $("#Ineligibility").removeAttr("disabled");
    $("#ReqRcpt").removeAttr("disabled");
    $("#ReqChange").removeAttr("disabled");
    $("#Checklist").removeAttr("disabled");
    $("#FamilyNOARequiredDocuments").removeAttr("disabled");
    $("#FamilyNOARequiredDocuments").css('background-color', 'white');
    $('.reasonForAction').css("visibility", "hidden");

    // alert("in control reset")
    //$('#TypeOfChangeOther').attr('checked', false);
    $('.changeOtherTextbox').css("visibility", "hidden");
    $('.TypeOfChangeGroup').css("visibility", "hidden");
    $("#select_documents").show();
    $(".ExcludePrivateSchedHoursOpt").show()

}

function setUpNOATypeControlls(selectedNOATypeID, DPSSFormatID, CDEFormatID) {


    switch (selectedNOATypeID) {
        case 0: //NOAType:CDE
            reEnableFieldsDisabledByNOAType();
            setupForCDE(CDEFormatID);

            break;
        case 1: //NOAType:DPSS
            reEnableFieldsDisabledByNOAType();

            //disable fields for DPSS: Format "CCRC" in sysOption "DPSS NOA" 
            if (DPSSFormatID == 8 || DPSSFormatID == 11) {
                $("#AppealDate").attr("disabled", true);
                $("#OtherText").attr("disabled", true);
                $("#OtherText").css('background-color', 'transparent');
                $("#Determination").attr("disabled", true);
                $("#Recertification").attr("disabled", true);
                $("#DelinquentFee").attr("disabled", true);
                $("#FamilyNOARequiredDocuments").attr("disabled", "disabled");
                $("#FamilyNOARequiredDocuments").css('background-color', 'transparent');
                $("#select_documents").hide();
                if ($('.checkedaction:checked'))
                    $('.reasonForAction').css("visibility", "visible");
                $(".ExcludePrivateSchedHoursOpt").show()
            }
                //disable fields for DPSS: Format "Consortium" in sysOption "DPSS NOA"
                //disable fields for DPSS: Format "Default" in sysOption "DPSS NOA"
            else if (DPSSFormatID == 3) {
                setupForDPSSFormat_Consortium();
            }
            else if (DPSSFormatID == 5) {
                if ($('.checkedaction:checked'))
                    $('.reasonForAction').css("visibility", "visible");
                setupForDPSSFormat_Default();
            }
                //disable fields for DPSS: Format "CHS" in sysOption "DPSS NOA" 
            else if (DPSSFormatID == 9) {
                $("#AppealDate").attr("disabled", true);
                $("#Recertification").attr("disabled", true);
                $("#DelinquentFee").attr("disabled", true);
                $("#Referral").attr("disabled", true);
                $("#Ineligibility").attr("disabled", true);
                $("#ReqRcpt").attr("disabled", true);
                $("#ReqChange").attr("disabled", true);
                $("#Checklist").attr("disabled", true);
                $("#FamilyNOARequiredDocuments").attr("disabled", true);
                $("#NOAText2").attr("disabled", true);
                $("#NOAText3").attr("disabled", true);
                $("#OtherText").attr("disabled", true);
                $("#OtherText").css('background-color', 'transparent');
                if ($('.checkedaction:checked'))
                    $('.reasonForAction').css("visibility", "visible");

            }
            break;
        case 2: //NOAType: Provider NOA Stage 1

            //Enable all disabled fields
            reEnableFieldsDisabledByNOAType();
            //disable fields for Provider NOA Stage 1: Format "Consortium"  or "Default" in sysOption "DPSS NOA"
            if (DPSSFormatID == 3 || DPSSFormatID == 5) {
                setupForProviderNOAStage1Format_Consortium_Default();
            }
                //disable fields for Provider NOA Stage 1: Format "CHS" in sysOption "DPSS NOA"
            else if (DPSSFormatID == 9) {
                setupForProviderNOAStage1Format_CHS();
            }
                //disable fields for Provider NOA Stage 1: Format "CCRC" and "MAOF" in sysOption "DPSS NOA"
            else if (DPSSFormatID == 8 || DPSSFormatID == 11) {
                setupForProviderNOAStage1Format_CCRC();
            }
            break;
        case 3:  //Request for Doc
            reEnableFieldsDisabledByNOAType();
            setupForRequestForDocumentation();
            break;
    }

}

function displayActionForm(selectedActionName, DPSSFormatID, CDEFormatID, reasonForm) {

    var selectedNOATypeID = $("#FamilyNOATypeID option:selected").index();

    var title = (reasonForm == true) ? "Reason For Action- " + selectedActionName : selectedActionName;
    title = (title == "ReqChange") ? "Request Change" : title;
    title = (title == "InitialApproval") ? "Initial Approval" : title;
    title = (title == "PaymentChange") ? "Payment Change" : title;
    title = (title == "ReqRcpt") ? "Request Receipt" : title;
    title = (title == "Reason For Action- ReqChange") ? "Reason For Action- Request Change" : title;
    title = (title == "Reason For Action- ReqRcpt") ? "Reason For Action- Request Receipt" : title;
    title = (title == "Reason For Action- DelinquentFee") ? "Reason For Action- Delinquent Fee" : title;
    title = (title == "Reason For Action- InitialApproval") ? "Reason For Action- Approval" : title;

    if ((selectedNOATypeID == 1 && selectedActionName != "Ineligibility") ||
        (selectedNOATypeID == 2 && (DPSSFormatID == 8 || DPSSFormatID == 9) && selectedActionName != "Change") || selectedNOATypeID == 2 && DPSSFormatID ==11) {

        if (DPSSFormatID == 8 || DPSSFormatID == 9 || DPSSFormatID == 11 || DPSSFormatID == 5) { //CCRC, CHS, DEFAULT BY ACTION, MAOF

            $.ajax({
                url: root + 'CaseManagement/FamilyNOA/DisplayActionForm/',
                data: 'selectedNOATypeID=' + selectedNOATypeID + '&selectedAction=' + selectedActionName + "&DPSSFormatID=" + DPSSFormatID + "&CDEFormatID=" + CDEFormatID + "&parentID=" + $("#FamilyID").val() + "&familyNOAID=" + $("#FamilyNOAID").val() + "&EffectiveDate=" + $("#EffectiveDate").val(),
                cache: false,
                success: function (data) {

                    var documentSelectorUIRef = new $APP.UI.Dialog({
                        id: 'actionForm',
                        title: title,
                        titleColor: 'green',
                        width: '80%',
                        lightbox: true,
                        iconURL: assets.images + 'icons/edit_16.png',
                        content: data,
                        shadow: true
                    });
                    documentSelectorUIRef.show();
                    $('#DisplayActionForm').val('');
                    $('.reasonForAction').css("visibility", "visible");
                    $APP.UI.hideLoading($('#NOA_form'));
                }
            });
        }

    }
    else if (selectedNOATypeID == 0 && CDEFormatID == 10) {
        $.ajax({
            url: root + 'CaseManagement/FamilyNOA/DisplayActionForm/',
            data: 'selectedNOATypeID=' + selectedNOATypeID + '&selectedAction=' + selectedActionName + "&DPSSFormatID=" + DPSSFormatID + "&CDEFormatID=" + CDEFormatID + "&parentID=" + $("#FamilyID").val() + "&familyNOAID=" + $("#FamilyNOAID").val() + "&EffectiveDate=" + $("#EffectiveDate").val(),
            cache: false,
            success: function (data) {
                var documentSelectorUIRef = new $APP.UI.Dialog({
                    id: 'actionForm',
                    title: title,
                    titleColor: 'green',
                    width: '80%',
                    lightbox: true,
                    iconURL: assets.images + 'icons/edit_16.png',
                    content: data,
                    shadow: true
                });
                documentSelectorUIRef.show();
                $('#DisplayActionForm').val('');
                $('.reasonForAction').css("visibility", "visible");
                $APP.UI.hideLoading($('#NOA_form'));
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

            }
        });
    }
}

function deleteNOACreatedFromAdd(FamilyID, FamilyNOAID) {

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/Delete/',
        data: "familyID=" + FamilyID + "&ID=" + FamilyNOAID + "&DeleteFromAddFlag=True",
        cache: false,
        type: "POST",
        success: function (data) {
            var parentList = $APP.UI.EditableLists.find('family_NOA_list');
            parentList.refreshList();
        }
    });
}

function copyNOA(FamilyNOAID) {

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/CopyNOA/',
        data: "ID=" + FamilyNOAID,
        cache: false,
        success: function (data) {

            $.ajax({
                url: root + 'CaseManagement/FamilyNOA/Show/',
                data: "familyID=" + $("#FamilyID").val() + "&ID=" + data.newNOAID,
                cache: false,
                success: function (data) {
                    alert("The Family NOA has been copied. The NOA date, Effective Date, Appeal Date, and Date Given of the new NOA have been modified.")
                    var parentList = $APP.UI.EditableLists.find('family_NOA_list');
                    parentList.refreshList();

                    var parentContainer = $("#NOA_form").closest("div")
                    $(parentContainer).html(data)
                    // requeryNOATemplate();
                    $("#CopyFrom").empty()
                    $APP.registerNewContent($(parentContainer));
                    $APP.UI.hideLoading($(parentContainer));
                }
            });
        }
    });
}

function requeryNOATemplate() {

    var familyID = ($('#FamilyID').val() == "" ? 0 : $('#FamilyID').val());
    var programID = ($('#ProgramID').val() == "" ? 0 : $('#ProgramID').val());
    var EffectiveDate = ($('#EffectiveDate').val() == "" ? "" : $('#EffectiveDate').val());
    var noaTypeID = $("#FamilyNOATypeID").val();

    $APP.UI.showLoading($('#NOA_form'));

    //object create to store the name and checked status of actions
    var actionsArray = [
        { 'name': $("#Determination").attr("name"), "checked": $("#Determination").is(":checked") },
        { 'name': $("#InitialApproval").attr("name"), "checked": $("#InitialApproval").is(":checked") },
        { 'name': $("#Change").attr("name"), "checked": $("#Change").is(":checked") },
        { 'name': $("Recertification").attr("name"), "checked": $("#Recertification").is(":checked") },
        { 'name': $("#Denied").attr("name"), "checked": $("#Denied").is(":checked") },
        { 'name': $("#Terminated").attr("name"), "checked": $("#Terminated").is(":checked") },
        { 'name': $("#PaymentChange").attr("name"), "checked": $("#PaymentChange").is(":checked") },
        { 'name': $("#DelinquentFee").attr("name"), "checked": $("#DelinquentFee").is(":checked") },
        { 'name': $("#Referral").attr("name"), "checked": $("#Referral").is(":checked") },
        { 'name': $("#Ineligibility").attr("name"), "checked": $("#Ineligibility").is(":checked") },
        { 'name': $("#ReqRcpt").attr("name"), "checked": $("#ReqRcpt").is(":checked") },
        { 'name': $("#ReqChange").attr("name"), "checked": $("#ReqChange").is(":checked") },
        { 'name': $("#Checklist").attr("name"), "checked": $("#Checklist").is(":checked") },
        { 'name': $("#SpanishNOA").attr("name"), "checked": $("#DocumentLanguageID option:selected").text().toLowerCase() == "spanish" }
    ];

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/RequeryNOATemplates/',
        data: 'FamilyID=' + familyID + "&NOATypeID=" + noaTypeID + "&ProgramID=" + programID + "&EffectiveDate=" + EffectiveDate + "&Determination=" + actionsArray[0].checked +
                  "&InitialApproval=" + actionsArray[1].checked + "&Change=" + actionsArray[2].checked + "&Recertification=" + actionsArray[3].checked + "&Denied=" + actionsArray[4].checked +
                  "&Terminated=" + actionsArray[5].checked + "&PaymentChange=" + actionsArray[6].checked + "&DelinquentFee=" + actionsArray[7].checked + "&Referral=" + actionsArray[8].checked +
                  "&Ineligibility=" + actionsArray[9].checked + "&ReqRcpt=" + actionsArray[10].checked + "&ReqChange=" + actionsArray[11].checked + "&Checklist=" + actionsArray[12].checked +
                  "&Spanish=" + actionsArray[13].checked,
        cache: false,
        success: function (data) {

            $('#CopyFrom').empty();

            $.each(data.template, function (i, Obj) {

                var noaTxt = Obj.NOAText
                var justificationTxt = Obj.ActionJustificationText
                var index = Obj.NOATemplateID

                strTemplates[index] = []
                strTemplates[index][0] = noaTxt;
                strTemplates[index][1] = justificationTxt;
            });


            $.each(data.docs, function (val, text) {
                var truncatedTxt = text.length > 100 ? text.substring(0, 100 - 3) + '...' : text

                $('#CopyFrom').append('<option isOpt = true value="' + val + '">' + truncatedTxt + '</option>');

                $("#CopyFrom").append($("#CopyFrom option").remove().sort(function (a, b) {
                    var at = $(a).text(), bt = $(b).text();
                    return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
                }));
            });
            $('#CopyFrom').val($("#CopyFrom option:first").val());



            //requeryList($('#CopyFrom'), data.docs);

            $APP.UI.hideLoading($('#NOA_form'));
        }

    });

}

function selectChildren() {

    $APP.UI.showLoading($('#NOA_form'));

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/ChildrenSelector/',
        data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val(),
        cache: false,
        success: function (data) {
            var childrenSelectorUIRef = new $APP.UI.Dialog({
                id: 'childrenSelector',
                title: 'Select Children',
                titleColor: 'green',
                width: '66%',
                lightbox: true,
                iconURL: assets.images + 'icons/edit_16.png',
                content: data,
                shadow: true
            });
            childrenSelectorUIRef.show();
            $APP.UI.hideLoading($('#NOA_form'));
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

        }
    });
}

function registerChildListingBehavior(scope) {

    $(scope).find(".show_provider_search").bind("click", function (event) {
        event.preventDefault();
        $("#selectedChildID").val($(this).attr('id'));
        showProviderSearchForm('provider_search', 'Provider Search');

    });

    $(scope).find(".child_status_button").bind("click", function (event) {
        event.preventDefault();

        var imageRef = $(this).find(".inner_content img");
        var childID = $(this).attr('id');

        if (imageRef.hasClass("icon_Small_Close")) {

            $(imageRef).removeClass('icon_Small_Close').addClass('icon_Small_Checkmark');
            $('#IncludeOnNOA_' + childID).val(true);
        }
        else {
            $(imageRef).removeClass('icon_Small_Checkmark').addClass('icon_Small_Close');
            $('#IncludeOnNOA_' + childID).val(false);
        }

    });

    $(scope).find(".providerName").each(function () {

        var childID = $(this).attr("id").replace("providerName_", "");
        var selectedProvider = $(this).val();

        if (selectedProvider == "") {
            //get child provider if only one exist
            $.ajax({
                url: root + 'CaseManagement/FamilyNOA/ChildProviders/',
                data: 'childID=' + childID,
                cache: false,
                success: function (data) {
                    if ($("#providerName_" + childID).html() == "&nbsp;") {
                        $("#providerName_" + childID).html(data.providerName);
                        $("#ProviderID_" + childID).val(data.providerID);
                    }
                }
            });
        }

    });

    $('#id_save_children_button').bind('click', function (event) {
        event.preventDefault();

        var formAction = $('#children_selector_form').attr('action');
        var validProviders = true;
        //validate provider selection
        $("tr.child_row").each(function (index) {
            var provID_Field = $(this).attr("id").replace("child_row_", "");

            if ($(this).find('.icon_Small_Checkmark').length != 0 && ($("#ProviderID_" + parseInt(provID_Field)).val() == "" || $("#ProviderID_" + parseInt(provID_Field)).html() == "0")) {
                validProviders = false;
            }

            if (index == $("tr.child_row").length - 1) {
                if (validProviders == false) {
                    $("#no_provider_msg").css("display", "block");
                }
                else {
                    $("#no_provider_msg").css("display", "none");
                    $.post(formAction, $('#children_selector_form').serialize(), function (data) {
                        $('#childrenSelector').remove();
                    });
                }
            }
        });
    });
}


function selectScheudle() {

    $APP.UI.showLoading($('#NOA_form'));

    $.ajax({
        url: root + 'CaseManagement/FamilyNOA/ScheduleSelector/',
        data: 'parentID=' + $('#FamilyID').val() + "&id=" + $('#FamilyNOAID').val() + "&effectiveDate=" + $("#EffectiveDate").val() + "&NOATypeID=" + $("#FamilyNOATypeID option:selected").val(),
        cache: false,
        success: function (data) {
            var scheduleSelectorUIRef = new $APP.UI.Dialog({
                id: 'scheduleSelector',
                title: 'Select Schedule',
                titleColor: 'green',
                width: '66%',
                lightbox: true,
                iconURL: assets.images + 'icons/edit_16.png',
                content: data,
                shadow: true
            });
            scheduleSelectorUIRef.show();
            $APP.UI.hideLoading($('#NOA_form'));
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

        }
    });
}

function registerScheduleListingBehavior(scope) {

    $(scope).find(".schedule_status_button").bind("click", function (event) {
        event.preventDefault();

        var imageRef = $(this).find(".inner_content img");
        var id = $(this).attr('id');

        if (imageRef.hasClass("icon_Small_Close")) {

            $(imageRef).removeClass('icon_Small_Close').addClass('icon_Small_Checkmark');
            $('#IncludeOnNOA_' + id).val(true);
        }
        else {
            $(imageRef).removeClass('icon_Small_Checkmark').addClass('icon_Small_Close');
            $('#IncludeOnNOA_' + id).val(false);
        }

    });

    $('#save_schedule_button').bind('click', function (event) {
        event.preventDefault();

        var formAction = $('#schedule_selector_form').attr('action');
        $.post(formAction, $('#schedule_selector_form').serialize(), function (data) {
            $('#scheduleSelector').remove();
        });
    });
}