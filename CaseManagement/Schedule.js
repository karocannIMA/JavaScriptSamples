
// This isn't necessary as these functions are performed by the framework
// when the page loads - SW
//  forms.registerFormatHandlers($('form'));
//  forms.registerUndoButton($('#schedule_information_form'));

$('#delete_schedule_button').bind('click', function (event) {
    event.preventDefault();

    if ($('#confirm_delete').css('display') != 'block') {
        var confirmDialog = $APP.UI.Confirm({
            id: "confirm_delete",
            message: "<strong>Are you sure you want to delete this schedule?</strong>",
            onConfirm: function () {
                deleteURL = $('#delete_schedule_form').attr("action").replace(/ConfirmDelete/, 'Delete');
                $('#delete_schedule_form').attr("action", deleteURL);
                $('#delete_schedule_form').submit();
            }
        });
        confirmDialog.show();
    }
});

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




$('.cancel_button').bind('click', function (event) {
    event.preventDefault();

    if ($('#confirm_cancel').css('display') != 'block') {
        var confirmDialog = $APP.UI.Confirm({
            id: "confirm_cancel",
            message: "Are you sure you want to cancel adding a new schedule?",
            importance: 'high',
            onConfirm: function () {
                document.location.reload()
            }
        });
    }
});

//Unsaved data warning message

if($("#UnsavedDataWarning").val() ==1){

    $(window).bind('beforeunload', function () {

        if (sessionStorage.getItem('isDirty') == "true") {
            return 'Continue without Saving?';
        }
    });

    $(window).unload(function () {
        sessionStorage.setItem('isDirty', false);
    });
}

    /*
    *FUNCTION NEEDED TO GENERATE FAMILYNOA
    */

 function setUpNOAGeneration(childID, effectiveDate, templateCount) {

     $.ajax({
         url: root + 'CaseManagement/Schedule/GenerateNOAOption_NewSchedule/',
         cache: false,
         success: function (data) {
             if (data.option == 2) {

                 $APP.UI.Confirm({
                     id: "confirm_clear",
                     message: "Do you wish to generate an NOA for this schedule?",
                     importance: 'high',
                     onConfirm: function () {
                         checkNOATemplate(data.option, childID, effectiveDate, "02", templateCount);
                     }
                 });
             }
             else if (data.option == 1)
                 checkNOATemplate(data.option, childID, effectiveDate, "02", templateCount);
         }
     });
 }

    function checkNOATemplate(generateNOAOption, childID, effectiveDate, noaCategoryCode, templateCount) {


        switch (templateCount) {
            case "0":
                alert("There are no NOA Templates set up for new schedules NOA Templates");
                break;
            case "1":
                generateNOA(generateNOAOption, childID, effectiveDate, noaCategoryCode, 0);
                break;
            default:
                $.ajax({
                    url: root + 'CaseManagement/Schedule/NOATemplateSelection/',
                    data: "ChildID=" + childID + "&EffectiveDate=" + effectiveDate + "&NOACategoryCode=" + noaCategoryCode + "&GenerateNOAOption=" + generateNOAOption,
                    cache: false,
                    success: function (data) {
                        var detailDialog = new $APP.UI.Dialog({
                            id: 'noaTemplateSelection',
                            title: "NOA Template Selection",
                            titleColor: 'blue',
                            width: '80%',
                            lightbox: true,
                            iconURL: assets.images + 'icons/opnbr_16.png',
                            content: data,
                            shadow: true
                        });
                        detailDialog.show();
                    }
                });
                break;
        }
    }

    function generateNOA(generateNOAOption, childID, effectiveDate, noaCategoryCode, templateID) {

        $.ajax({
            url: root + 'CaseManagement/Schedule/GenerateNOA/',
            data: "ChildID=" + childID + "&EffectiveDate=" + effectiveDate + "&NOACategoryCode=" + noaCategoryCode + "&TemplateID=" + templateID,
            cache: false,
            success: function (data) {

                if (generateNOAOption == 1)
                    OpenFamilyNOAReport(data.NOAID)
                else if (generateNOAOption == 2)
                    ShowNOAForm(data.NOAID, data.familyID)
            }
        });
    }

    function OpenFamilyNOAReport(noaID) {

        var criteriaDestination = $('#ReportAnchorForm div.hidden_fields');
        criteriaDestination.html('');
        var htmlData = '<input type="hidden" name=NOAID id=NOAID value="' + noaID + '">';
        criteriaDestination.append($(htmlData));

        $APP.Reports.print(document.getElementById('ReportAnchorForm'), root + 'Reports/FamilyNOAReport/DisplayReport');
    }

    function ShowNOAForm(noaID, familyID) {
        $.ajax({
            url: root + 'CaseManagement/FamilyNOA/Show/',
            data: 'familyID=' + familyID + "&ID=" + noaID,
            cache: false,
            success: function (data) {
                var FamilyNOADialog = new $APP.UI.Dialog({
                    id: 'familyNoa_form',
                    title: 'Family NOA',
                    titleColor: 'blue',
                    width: '100%',
                    lightbox: true,
                    iconURL: assets.images + 'icons/edit_16.png',
                    content: data,
                    shadow: true
                });
                FamilyNOADialog.show();
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

            }
        });

    }
    /*/
    * ON SAVE VALIDATION
    ***********************************************/

    $("#id_save_schedule").bind("click", function (e) {
        e.preventDefault();

        $('#save_schedule').css('opacity', '0.2');
        $("#id_save_schedule").attr("disabled", true);

        //check pre submit validation: inactive provider , maxEnrollment (provider/classrrom), Schedule_SyncRateBook_RMRValidatin
        $.ajax({
            url: root + 'CaseManagement/Provider/ValidateProvider/',
            data: 'id=' + $("#ProviderID").val() + '&StartDate=' + $("#StartDate").val() + '&StopDate=' + $("#StopDate").val(),
            cache: false,
            success: function (data) {

                var inactiveProviderOption = parseInt(data.inactiveProviderOptions);

                switch (inactiveProviderOption) {
                    case 1:
                        var confirmDialog = new $APP.UI.Confirm({
                            id: "confirm_AssignToInactiveProvider",
                            message: "<strong>The provider you have selected is inactive. <br><br> Do you wish to assign this provider anyway?</strong>",
                            lightbox: false,
                            onConfirm: function () {
                                 MaximumEnrollmentMsg();
                            }
                        });
                        confirmDialog.show();
                        break;
                    default:
                       MaximumEnrollmentMsg();
                        break;
                }
            }
        });

    });

    function MaximumEnrollmentMsg() {

        var childID = $("#ChildID").val();
        var providerID = $("#ProviderID").val();
        var classroomID = $("#ClassroomID").val();
        var AllowSubmit = 0;

        $.ajax({
            url: root + 'CaseManagement/Schedule/MaximumEnrollmentCheck/',
            data: 'ChildID=' + childID + '&ProviderID=' + $("#ProviderID").val() + '&ClassroomID=' + classroomID,
            cache: false,
            success: function (data) {

                if (data.MaxProvider > 0) {
                    confirmDialog_MaxProvider = new $APP.UI.Confirm({
                        id: "confirm_ExceedMaxProvider",
                        message: "<strong>Maximum enrollment of " + data.MaxProvider + " for this provider will be exceeded! <br><br> Do you want to override the maximum enrollment?</strong>",
                        lightbox: false,
                        onConfirm: function () {
                            if (data.MaxClassroom > 0) {
                                confirmDialog_MaxClassroom = new $APP.UI.Confirm({
                                    id: "confirm_ExceedMaxclassroom",
                                    message: "<strong>Maximum enrollment of " + data.MaxClassroom + " for this classroom will be exceeded! <br><br> Do you want to override the maximum enrollment?</strong>",
                                    lightbox: false,
                                    onConfirm: function () {
                                        if ($("#SyncRateBookOption").val() == "True")
                                            Schedule_SyncRateBook_RMRValidatin();
                                        else
                                            $("#schedule_information_form").submit();
                                    }
                                });
                                confirmDialog_MaxClassroom.show();
                            }
                            else {
                                if ($("#SyncRateBookOption").val() == "True")
                                    Schedule_SyncRateBook_RMRValidatin();
                                else
                                    $("#schedule_information_form").submit();
                            }
                        }, 
                        onCancel: function () {
                    }
                    });
                    confirmDialog_MaxProvider.show();
                }
               else if (data.MaxClassroom > 0) {
                    confirmDialog_MaxClassroom = new $APP.UI.Confirm({
                        id: "confirm_ExceedMaxclassroom",
                        message: "<strong>Maximum enrollment of " + data.MaxClassroom + " for this classroom will be exceeded! <br><br> Do you want to override the maximum enrollment?</strong>",
                        lightbox: false,
                        onConfirm: function () {
                            if ($("#SyncRateBookOption").val() == "True")
                                Schedule_SyncRateBook_RMRValidatin();
                            else
                                $("#schedule_information_form").submit();
                        }
                    });
                    confirmDialog_MaxClassroom.show();
                }
                else {

                    if ($("#SyncRateBookOption").val() == "True")
                        Schedule_SyncRateBook_RMRValidatin();
                    else
                        $("#schedule_information_form").submit();

                }

            }
        });
     }

     function Schedule_SyncRateBook_RMRValidatin() {
      $.ajax({
          url: root + 'CaseManagement/Schedule/ValidateRMRByScheduleSyncRateBook/',
            data: 'ScheduleId=' + $("#ScheduleID").val() + '&ChildID=' + $("#ChildID").val() + '&StartDate=' + $("#StartDate").val() + '&StopDate=' + $("#StopDate").val(),
            cache: false,
            success: function (data) {
                 if (data.intRetVal == 2) {
                    if(data.booRMROverride == "True"){ 
                        confirmDialog_OverrideRMR = new $APP.UI.Confirm({
                            id: "confirm_OverrideRMR",
                            message: "This schedule has one or more rate book detail entries in excess of the Regional Market Rate. <br><br> Would you like to override the RMR?",
                            lightbox: false,
                            onConfirm: function () {
                                $("#schedule_information_form").submit();
                            }
                        });
                        confirmDialog_OverrideRMR.show();
                    }   
                    else{
                        $("#schedule_information_form").submit();
                    }
                 }
                 else if(data.intRetVal != 2 &&  data.intRetVal !=1 ){
                     $("#schedule_information_form").submit();
                 }   
         }
       });           
     }

 //    function ScheduleRMRValidation() {

 //        if($("#ProviderTypeID").val() == ""){
 //            alert("No provider has been selected or no provider type has been assigned to the provider.  Cannot validate RMR.");
 //        }
 //       else{
 //            $.ajax({
 //                url: root + 'CaseManagement/Schedule/ValidateRMRBySchedule/',
 //                data: 'ScheduleId=' + $("#ScheduleID").val() + '&ChildID=' + $("#ChildID").val() + '&ProviderID='+$("#ProviderID").val()+'&ProviderTypeID='+$("#ProviderTypeID").val()+ '&StartDate=' + $("#StartDate").val() + '&StopDate=' + $("#StopDate").val() +'&UseCurrentDate='+$("#UseCurrentDate").is(":checked"),
 //                cache: false,
 //                success: function (data) {

 //                    if (data.booRMRExist == true) {

 //                        if (data.intRetVal == 0) {
 //                            alert(data.strMsg);
 //                        }
 //                        else if (data.intRetVal == 1 && data.boolOverrideRMR == true) {

 //                            confirmDialog_OverrideRMR = new $APP.UI.Confirm({
 //                                id: "confirm_OverrideRMR",
 //                                message: data.strMsg + " <br><br> Would you like to override the RMR?",
 //                                lightbox: false,
 //                                onConfirm: function () {
 //                                    $("#schedule_information_form").submit();
 //                                }
 //                            });
 //                            confirmDialog_OverrideRMR.show();
 //                        }
 //                        else if (data.intRetVal == 2 && data.boolOverrideRMR == true) {

 //                            confirmDialog_SetCoPay = new $APP.UI.Confirm({
 //                                id: "confirm_SetCoPay",
 //                                message: data.strMsg + " <br><br> Do you want CARE to automatically calculate co-pay amounts?",
 //                                lightbox: false,
 //                                onConfirm: function () {
 //                                    $.ajax({
 //                                        url: root + 'CaseManagement/Schedule/ValidateRMRBySchedule_SetCoPay/',
 //                                        data: 'ScheduleId=' + $("#ScheduleID").val() + '&ChildID=' + $("#ChildID").val() + '&ProviderID=' + $("#ProviderID").val() + '&ProviderTypeID=' + $("#ProviderTypeID").val() + '&StartDate=' + $("#StartDate").val() + '&StopDate=' + $("#StopDate").val() + '&UseCurrentDate=' + $("#UseCurrentDate").is(":checked"),
 //                                        cache: false,
 //                                        success: function (data) {
 //                                            $("#schedule_information_form").submit();
 //                                        }
 //                                    });
 //                                }
 //                            });
 //                            confirmDialog_SetCoPay.show();
 //                        }
 //                        else {
 //                            $("#schedule_information_form").submit();
 //                        }
 //                    }
 //                    else {
 //                        $("#schedule_information_form").submit();
 //                    }
 //                }
 //    });
 //   }
 //}