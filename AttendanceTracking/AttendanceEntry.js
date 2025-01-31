
//Set stop date if start date changes
$('#StartDate').bind('change', function (event) {
    var startDate = new Date($APP.Forms.Formats.formatDate($('#StartDate').val()));
    var stopDate = startDate.moveToLastDayOfMonth();

    if (startDate instanceof Date && !isNaN(startDate.valueOf())) //check to see if start date is a valid date
        $('#StopDate').val(stopDate.toString("M/d/yyyy"));
    else
        $('#StopDate').val("");
});


//Populate provider list based on entries in child ID, start date, and stop date
$('#ChildID, #StartDate, #StopDate').bind('blur', function (event) {
    if ($("#View").val() != 2) {
        getProviderList();
    }
});

//Populate child name based on child ID
$('#ChildID').bind('blur', function (event) {
    getChildName($('#ChildID').val());
});

//populate provider name based on Provider ID (for daily and month by classroom View only)
$("#ProviderID, #AttendanceDate, #ClassroomID_Criteria, #ChildID").bind('change', function (event) {
    if ($("#View").val() == 2) { //daily view
        getProviderName($("#ProviderID").val(), $("#ClassroomID_Criteria").val());
       // showDetail_Daily();
    }
});

//Override search link behavior
$('#show_child_search').bind('click', function (event) {
    event.preventDefault();

    showChildSearchForm('child_search', 'Child Search');
});

//Override search link behavior
$('#show_provider_search').bind('click', function (event) {
    event.preventDefault();
    showProviderSearchForm('provider_search', 'Provider Search');
});

function showDetail() {


    var startDate, stopDate, classroomID

    if ($("#StartDate_Criteria").length)
        startDate = $("#StartDate_Criteria").val();
    else
        startDate = $("#StartDate").val();

    if ($("#StopDate_Criteria").length)
        stopDate = $("#StopDate_Criteria").val();
    else
        stopDate = $("#StopDate").val();

    if ($("#ClassroomID_Criteria").length)
        classroomID = $("#ClassroomID_Criteria").val();
    else if ($("#ClassroomID").length)
        classroomID = $("#ClassroomID").val();
    else
        classroomID = 0

    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/ShowDetail/',
        cache: false,
        type: "Post",
        data: "ChildID=" + $("#ChildID").val() + "&ProviderID=" + $("#ProviderID").val() + "&ClassroomID=" + classroomID + "&StartDate=" + startDate + "&StopDate=" + stopDate,
        success: function (data) {

            $('#attendance_entry_detail').html(data);
            registerNewDetail($('#attendance_entry_detail'));
            registerDetail($('#attendance_entry_detail'));
            $APP.UI.hideLoading($('#attendance_entry_detail'));
        }
    });
    //$.post('Entry/ShowDetail', $('#AttendanceEntryForm').serialize(), function (data) {
    //    $('#attendance_entry_detail').html(data);
    //    //        $("#PassValidation").val(false);
    //    registerNewDetail($('#attendance_entry_detail'));
    //    registerDetail($('#attendance_entry_detail'));
    //    $APP.UI.hideLoading($('#attendance_entry_detail'));
    //});
}

function showDetail_Daily() {
    $APP.UI.showLoading($('#attendance_entry_detail'));

    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/ShowDetail_Daily/',
        cache: false,
        data: "ChildID=" + $("#ChildID").val() + "&ProviderID=" + $("#ProviderID").val() + "&ClassroomID=" + $("#ClassroomID_Criteria").val() + "&AttendanceDate=" + $("#AttendanceDate").val(),
        success: function (data) {

            $('#attendance_entry_detail').html(data);
            registerNewDetail($('#attendance_entry_detail'));
            registerDetail($('#attendance_entry_detail'));

            $APP.UI.hideLoading($('#attendance_entry_detail'));

        }
    });
}



function clearInputFields() {
    $('#ChildID').val('');
    $('#ChildName').html('');
    //    $('#StartDate').val('');
    //    $('#StopDate').val('');
    $('option', '#ProviderID').remove();


    if ($("#View").val() == 3) { //refresh child listing with Attendance Entered = "NO"
        $("#AttendanceEntered").val(0);
        $("#AttendanceEntered").blur();
    }
}

function clearInputFieldsDaily() {
    $('#ChildID').val('');
    $('#ChildName').html('');
    $('#ProviderID').val('');
    $('#providerName').html('');
    $('option', '#ClassroomID_Criteria').remove();
}

function clearInputsFieldsBulk() {

    $("#ProviderID_Criteria").val('')
    $("#providerName").html('')
    $('option', '#ClassroomIDCriteria').remove()

    $("#AttendanceEntered").val(0)
    $(".child_search_results").html('')
}

//Set calculate button to populate default attendance and return results via Ajax
$('#calculate_attendance_button').bind('click', function (event) {
    event.preventDefault();

    
    if ($("#View").val() == 2) {

        $APP.UI.Confirm({
            id: "confirm_override",
            message: "Are you sure you wish to overwrite the existing attendance record based on the child's schedule?",
            importance: 'high',
            onConfirm: function () {

                $.ajax({
                    url: root + 'AttendanceTracking/AttendanceEntry/CalculateAttendanceDaily/',
                    cache: false,
                    data: "ChildID=" + $("#ChildID").val() + "&ProviderID=" + $("#ProviderID").val() + "&ClassroomID=" + $("#ClassroomID_Criteria").val() + "&AttendanceDate=" + $("#AttendanceDate").val(),
                    success: function (data) {
                        if (data.result == 0) {
                            if (data.isValidRights == 0) {

                                var confirmDialog = $APP.UI.Confirm({
                                    id: "invalid_rights",
                                    message: "You do not have rights to process the attendance.<br/><br/>",
                                    showNoButton: false,
                                    yesLabel: 'Continue',
                                    onConfirm: function () {
                                        $APP.UI.hideLoading($('#attendance_entry_detail'));
                                    }
                                });
                                $("#invalid_rights").find(".message").css("text-align", "left");
                                confirmDialog.show();

                            }
                            else {
                                showDetail_Daily();
                            }
                        } else {
                            alert(data.message);
                            $APP.UI.hideLoading($('#attendance_entry_detail'));
                        }
                    },
                    error: function (data) {
                        alert('An error occurred.');
                        $APP.UI.hideLoading($('#attendance_entry_detail'));
                    }
                });
            }
        });
    }
    else {
        var startDate = Date.parse($('#StartDate').val());
        var stopDate = Date.parse($('#StopDate').val());
        var dateDifference = Math.abs(startDate.getMonth() - stopDate.getMonth() + (12 * (startDate.getFullYear() - stopDate.getFullYear())));

        if (dateDifference > 1) {
            alert("Attendance can only be submitted for one month at a time.");
        }
        else {
            $APP.UI.showLoading($('#attendance_entry_detail'));
            $.post('Entry/CalculateAttendance', $('#AttendanceEntryForm').serialize(), function (data) {
                if (data.result != -1) {
                  if (data.isValidRights == 0) {

                    var confirmDialog = $APP.UI.Confirm({
                        id: "invalid_rights",
                        message: "You do not have rights to process the attendance.<br/><br/>",
                        showNoButton: false,
                        yesLabel: 'Continue',
                        onConfirm: function () {
                            $APP.UI.hideLoading($('#attendance_entry_detail'));
                        }
                    });
                    $("#invalid_rights").find(".message").css("text-align", "left");
                    confirmDialog.show();

                  }
                  else {
                        showDetail();
                    }
                } else {
                    alert(data.message);
                    $APP.UI.hideLoading($('#attendance_entry_detail'));
                }
            });
        }
    }
});

//Override form action when Submit button is clicked
$('#submit_attendance_button').bind('click', function (event) {
    event.preventDefault();

    if ($("#View").val() == 2) {
        validateDaily();
    }
    else
        submitMonthly();

});

function validateDaily() {
    //needed to require program for all children: FUTURE FEATURE?
    //var programValidationError = false

    if ($("#AccountClosingDate").val() != "" && (new Date($("#AttendanceDate").val()) <= new Date($("#AccountClosingDate").val()))) {
        alert("Attendance entry dated prior to the Accounting Closing Date of " + $("#AccountClosingDate").val() + " cannot be submitted. The Accounting Closing Date is set in System Options.");
    }
        //else if ($("#ProgramValidationError").val() == "true") {
        //    $("#programError").css("display", "block");
        //}
    else {
        var validHours = true

        $("#attendance_entry_detail tbody tr.summary_row").each(function (index) {

            var attId = $(this).find(".total_hours").attr("id").toString().replace("TotalHours_", "");
            var totalHours = $(this).find(".total_hours").val();
            calTotalHours = 0

            $(".attendance_detail_row_" + attId).each(function (index) {
                var attDetailID = $(this).find('.attendance_detail_hours').attr("id").toString().replace("Hours_" + attId + "_", "");
                calTotalHours = parseFloat(calTotalHours) + parseFloat($("#Hours_" + attId + "_" + attDetailID).val());

                // alert("in detail calc: "+calTotalHours + " " + totalHours)

                if (index == $(this).length) {
                    if (parseFloat(calTotalHours) != parseFloat(totalHours) && !isNaN(calTotalHours) && !isNaN(totalHours)) {
                        //alert("in detail calc last: " + calTotalHours + " " + totalHours)
                        validHours = false
                    }
                }
            });

            if (index == $(this).length) {

                if (validHours == false) {
                    alert("The total hours do not match with the caculated hours." + "\n" + "Please correct hours before submitting attendance.");//$("#incorrectHrs_msg").css("display", "block");
                }
                else {
                    submitDaily();
                    return false;
                }
            } else {
                submitDaily();
                return false;
            }

        });
    }
}

function submitDaily() {

    $("#programError").css("display", "none");
    $APP.UI.showLoading($('#attendance_entry_detail'));

    $('#AttendanceDisplay').append('<input type="hidden" name="ProviderIDCriteria" id="ProviderIDCriteria" value="' + $("#ProviderID").val() + '"/>');
    $('#AttendanceDisplay').append('<input type="hidden" name="ClassroomIDCriteria" id="ClassroomIDCriteria" value="' + $("#ClassroomID_Criteria").val() + '"/>');
    $('#AttendanceDisplay').append('<input type="hidden" name="ChildIDCriteria" id="ChildIDCriteria" value="' + $("#ChildID").val() + '"/>');
    $('#AttendanceDisplay').append('<input type="hidden" name="AttendanceDateCriteria" id="AttendanceDateCriteria" value="' + $("#AttendanceDate").val() + '"/>');
    $('#AttendanceDisplay').find("#AbsTypeWithCode").remove(); //removed due to encoding issue


    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/SubmitAttendanceDaily/',
        data: $('#AttendanceDisplay').serialize(),
        cache: false,
        type: 'post',
        success: function (data) {

            $('#AttendanceDisplay').find("#ProviderIDCriteria").remove();
            $('#AttendanceDisplay').find("#ClassroomIDCriteria").remove();
            $('#AttendanceDisplay').find("#ChildIDCriteria").remove();
            $('#AttendanceDisplay').find("#AttendanceDateCriteria").remove();

            if (data.success == "-1") {
                var msg = 'Attendance data has already been submitted for the criteria you have entered.  To submit new information, please delete this attendance data from Attendance History.';
                alert(msg);
                $APP.UI.hideLoading($('#attendance_entry_detail'));
            } else if (data.success == "-2") {

                alert("The sum of the hours entered do not match the Total Hours for the following dates(s):\n" + "\t" + data.message + "\nPlease review and make the nessecary adjustment prior to submitting attendance.");
                $APP.UI.hideLoading($('#attendance_entry_detail'));
            } else if (data.success == "-4") {

                alert('You do not have permission to add data for families outside of your division.');
                $APP.UI.hideLoading($('#attendance_entry_detail'));
            } else if (data.success == "-5") {

                alert(data.message);
                $APP.UI.hideLoading($('#attendance_entry_detail'));
            } else {
                clearInputFieldsDaily();
                showDetail_Daily();
            }
        }
    });
}

function submitMonthly() {

    var formAction = $('#AttendanceDisplay').attr('action');
    formAction += '/' + $('#ChildID').val();
    formAction += '/' + $('#ProviderID').val();
    formAction += '/' + $('#StartDate').val().replace(/\\/, '/');
    formAction += '/' + $('#StopDate').val().replace(/\\/, '/');

    //remove prev entered classroomID
    $('#AttendanceDisplay').find("#ClassroomIDCriteria").remove();
    $('#AttendanceDisplay').find("#View").remove();
    
    if ($("#View").val() != 1) {
        $('#AttendanceDisplay').append('<input type="hidden" name="ClassroomIDCriteria" id="ClassroomIDCriteria" value="' + $("#ClassroomID_Criteria").val() + '"/>');
    }
    $('#AttendanceDisplay').append('<input type="hidden" name="View" id="View" value="' + $("#View").val() + '"/>');

    var form = $('#AttendanceDisplay')
    $(form).find("#AbsTypeWithCode").remove(); //removed due to encoding issue

    var daysDifference = Math.floor((Date.parse($('#StopDate').val()) - Date.parse($('#StartDate').val())) / 86400000);

    if (daysDifference > 30) {

        alert("Date Range cannot be greater than a month");
    }
    else if ($("#AccountClosingDate").val() != "" && (new Date($("#StopDate").val()) <= new Date($("#AccountClosingDate").val()) || new Date($("#StartDate").val()) < new Date($("#AccountClosingDate").val()))) {
        alert("Attendance entry dated prior to the Accounting Closing Date of " + $("#AccountClosingDate").val() + " cannot be submitted. The Accounting Closing Date is set in System Options.");
    }
    else {
        $APP.UI.showLoading($('#attendance_entry_detail'));

        $.post(formAction, $(form).serialize(), function (data) {

            if (data.success == "-1") {
                var msg = 'Attendance data has already been submitted for the child, provider, and date range you have selected.  To submit new information, please delete this attendance data from Attendance History.';
                alert(msg);
                $APP.UI.hideLoading($('#attendance_entry_detail'));
            } else if (data.success == "-2") {

                alert("The sum of the hours entered do not match the Total Hours for the following dates(s):\n" + "\t" + data.message + "\nPlease review and make the nessecary adjustment prior to submitting attendance.");
                $APP.UI.hideLoading($('#attendance_entry_detail'));

            } else if (data.success == "-3") {

                var msg = 'Attendance data has already been submitted for the child, provider, classroom, and date range you have selected.  To submit new information, please delete this attendance data from Attendance History.';
                alert(msg);
                $APP.UI.hideLoading($('#attendance_entry_detail'));

            } else if (data.success == "-4") {

                var msg = 'You do not have permission to add data for families outside of your division.';
                alert(msg);
                $APP.UI.hideLoading($('#attendance_entry_detail'));

            } else if (data.success == "-5") {
                alert(data.message);
                $APP.UI.hideLoading($('#attendance_entry_detail'));

            } else if (data.parseErrorMsg != "") {
                alert(data.parseErrorMsg);
                $APP.UI.hideLoading($('#attendance_entry_detail'));
            }
            else {
                if ($("#View").val() == 3)
                    refreshChildListing();

                clearInputFields();
                showDetail();
            }
        });
    }
}

//Replace clear link when Clear button is clicked
$('#clear_attendance_button').bind('click', function (event) {
    event.preventDefault();

    currBestInterestAbsCnt = 0;
    currUnexcusedAbsCnt = 0;

    if ($("#View").val() == 2)
        clearDaily();
    else
        clearMonthly();
});

function clearMonthly() {

    if ($('#ChildID').val() && $('#ProviderID').val() && $('#StartDate').val() && $('#StopDate').val()) {
        $APP.UI.showLoading($('#attendance_entry_detail'));

        $.ajax({
            url: root + 'AttendanceTracking/AttendanceEntry/Clear/',
            data: "ChildID=" + $("#ChildID").val() + "&ProviderID=" + $("#ProviderID").val() + "&StartDate=" + $('#StartDate').val() + "&StopDate=" + $('#StopDate').val(),
            cache: false,
            success: function (data) {
                showDetail();
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));

            }
        });
    }
}

function clearDaily() {
    if ($('#ProviderID').val() && $("#AttendanceDate").val()) {
        $APP.UI.showLoading($('#attendance_entry_detail'));

        $.ajax({
            url: root + 'AttendanceTracking/AttendanceEntry/Clear_Daily/',
            data: "ChildID=" + $("#ChildID").val() + "&ProviderID=" + $("#ProviderID").val() + "&ClassroomID=" + $("#ClassroomID_Criteria").val() + "&AttendanceDate=" + $("#AttendanceDate").val(),
            cache: false,
            success: function (data) {
                showDetail_Daily();
            }
        });
    }
}

function registerDetail(scope) {

    $APP.registerNewContent(scope);
    $APP.UI.hideLoading(scope);

    //Enable/disable fields based on absence selection (run on initial load as well as when absence type is changed)
    $(scope).find('.absence_type').each(function (index) {
        handleAbsence(this);
        $(this).data("defaultVal", $(this).val());
    });

    $(scope).find('.absence_type').bind('change', function (event) {
        event.preventDefault();

        var absTypeObj = this;
        var attID = $(this).attr("id").replace('AbsenceTypeID_', '');
        var attDate = $("#AttendanceDate_" + attID).val();
        var absTypeID = $("#AbsenceTypeID_" + attID).val();
        var defaultVal = $(this).data("defaultVal")
        var childID;

        if ($("#View").val() == 2) 
            childID = $("#ChildID_" + attID).val()
        else if ($("#View").val() == 4) 
            childID = $("#ChildID_" + attID).val()
         else 
            childID = $("#ChildID").val()

        var view = $("#View").val();
        var currBestInterestAbsCnt = 0;
        var currUnexcusedAbsCnt = 0;

        //recalculate the current BI and Unexcuse
        $(scope).find('.absence_type').each(function (index) {
            var code = $(this).find("option:selected").attr("code");
            var val = $(this).find("option:selected").attr("code");
            var id = $(this).attr("id").replace('AbsenceTypeID_', '');
            var isEnrolledDay = $(scope).find("#IsEnrolledDay_" + id).val();

            if (code == "BI" && isEnrolledDay == "True") {
                currBestInterestAbsCnt++;
            }
            if (code == "UP" && isEnrolledDay == true) {
                currUnexcusedAbsCnt++;
            }
        });

        // alert(currBestInterestAbsCnt + "  " + currUnexcusedAbsCnt);
        //validate  best interest and unexcused days
        $.ajax({
            url: root + 'AttendanceTracking/AttendanceEntry/ValidateAbsence',
            data: "ChildID=" + childID + "&AbsenceTypeID=" + absTypeID + "&AbsenceDate=" + attDate +"&View="+view,
            cache: false,
            success: function (data) {

                if (view == 2) { //daily view
                    if (parseInt(data.currBestInterest) > parseInt(data.maxBestInterest) && data.absCode.toString().trim() == "BI") {

                        //limit BI 
                        if (data.limitBIOpt == 1) {

                            var confirmDialog = $APP.UI.Confirm({
                                id: "confirm_duplicate",
                                message: "<strong>This will exceed the maximum number of best interest days (" + data.maxBestInterest + ") for the current fiscal year. <br><br> Please select a different absence.</strong>",

                                showNoButton: false,
                                yesLabel: 'OK',
                                onConfirm: function () {
                                    $(absTypeObj).val(defaultVal)
                                }
                            });
                            confirmDialog.show();

                        } else {
                            $APP.UI.Confirm({
                                id: "confirm_duplicate",
                                message: "<strong>This will exceed the maximum number of best interest days (" + data.maxBestInterest + ") for the current fiscal year. <br><br> Are you sure you wish to save this absence?</strong>",
                                importance: 'high',
                                onConfirm: function () {
                                    handleAbsence(absTypeObj);

                                }, onCancel: function () {
                                    $(absTypeObj).val(defaultVal)
                                }
                            });
                        }
                    } else if (data.currUnexcused > data.maxUnexcused && data.absCode.toString().trim() == "UP") {

                        $APP.UI.Confirm({
                            id: "confirm_duplicate",
                            message: "<strong>This will exceed the maximum number of unexcused paid absence days (" + data.maxUnexcused + ") for the current fiscal year. <br><br>  Are you sure you wish to save this absence?</strong>",
                            importance: 'high',
                            onConfirm: function () {
                                handleAbsence(absTypeObj);

                            }, onCancel: function () {
                                $(absTypeObj).val(defaultVal)
                            }
                        });
                    } else {
                        handleAbsence(absTypeObj);
                    }
                } else {
                    //update current abs counts
                    if (data.absCode.toString().trim() == "BI") {
                        currBestInterestAbsCnt = parseInt(currBestInterestAbsCnt ) + parseInt(data.currBestInterest);
                    }
                    if (data.absCode.toString().trim() == "UP") {
                        currUnexcusedAbsCnt = parseInt(currUnexcusedAbsCnt) + parseInt(data.currUnexcused);
                    }

                    if (currBestInterestAbsCnt > data.maxBestInterest && data.absCode.toString().trim() == "BI") {

                        //limit BI 
                        if (data.limitBIOpt == 1) {

                            var confirmDialog = $APP.UI.Confirm({
                                id: "confirm_duplicate",
                                message:"<strong>This will exceed the maximum number of best interest days (" + data.maxBestInterest + ") for the current fiscal year.  <br><br> Please select a different absence.</strong>",

                                showNoButton: false,
                                yesLabel: 'OK',
                                onConfirm: function () {
                                    $(absTypeObj).val(defaultVal)
                                }
                            });
                            confirmDialog.show();

                        } else {
                            $APP.UI.Confirm({
                                id: "confirm_duplicate",
                                message: "<strong>This will exceed the maximum number of best interest days (" + data.maxBestInterest + ") for the current fiscal year. <br><br> Are you sure you wish to save this absence?</strong>",
                                importance: 'high',
                                onConfirm: function () {
                                    handleAbsence(absTypeObj);

                                }, onCancel: function () {
                                    $(absTypeObj).val(defaultVal)
                                }
                            });
                        }
                    } else if (currUnexcusedAbsCnt > data.maxUnexcused && data.absCode.toString().trim() == "UP") {

                        $APP.UI.Confirm({
                            id: "confirm_duplicate",
                            message: "<strong>This will exceed the maximum number of unexcused paid absence days (" + data.maxUnexcused + ") for the current fiscal year. <br><br>  Are you sure you wish to save this absence?</strong>",
                            importance: 'high',
                            onConfirm: function () {
                                handleAbsence(absTypeObj);

                            }, onCancel: function () {
                                $(absTypeObj).val(defaultVal)
                            }
                        });
                    } else {
                        handleAbsence(absTypeObj);
                    }
                }
            }
        });

    });

    $(scope).find('.attendance_detail_program').bind('blur', function () {
        if ($(this).val() == 0)
            $("#ProgramValidationError").val(true)
        else
            $("#ProgramValidationError").val(false)
    });

    //Register delete link behavior
    $(scope).find('.delete_attendance_detail').bind('click', function (event) {
        event.preventDefault();

        //Get row/day identifier for later use - needs to be done before removal
        var fieldName = this.id;
        var firstDelim = fieldName.indexOf('_');
        var secondDelim = fieldName.substr(firstDelim + 1).indexOf('_') + firstDelim + 1;
        var attID = fieldName.substring(firstDelim + 1, secondDelim);

        $(this).parent().parent().remove();
        $("#AttendanceTypeID_" + attID).val("");
        unselectMeals(attID);
        calculateTotalHours(attID);
    });

    //validate total hours with the actual hours from time period
    $(scope).find('.total_hours').bind('change', function () {

        var canModifyTotalHrs = $("#HasTotalHoursRights").val();

        //check if the user has rights to change the Hours
        if(canModifyTotalHrs == "True"){
            var totalHrs_Entered = $(this).val();
            //Get row/day identifier for later use - needs to be done before removal
            var fieldName = this.id;
            var attID = fieldName.replace("TotalHours_", '');

            calculateTotalHours(attID);
            //alert(totalHrs_Entered + " " + $('#TotalHours_' + attID).val());

            if (totalHrs_Entered != $('#TotalHours_' + attID).val()) {
                $APP.UI.Confirm({
                    id: "confirm_override",
                    message: "The total hours you have entered do not match with the total hours based on times entered. <br><br> Do you wish to override the calculated total hours with the total hours you have entered?",
                    importance: 'high',
                    onConfirm: function () {
                        $('#TotalHours_' + attID).val(totalHrs_Entered);
                    }
                });
            }
        } else {

            var confirmDialog = $APP.UI.Confirm({
                id: "security_rights",
                message: "<strong> You do not have rights to change Total Hours.</strong>",
                showNoButton: false,
                yesLabel: 'OK'
            });
            confirmDialog.show();
        }
    });

    //Register time in/out fields to auto-calculate hours
    $(scope).find('.attendance_detail_time').bind('blur', function (event) {


        var fieldName = this.id;
        var val = $(this).val()
        var firstDelim = fieldName.indexOf('_');
        var secondDelim = fieldName.substr(firstDelim + 1).indexOf('_') + firstDelim + 1;

        var attID = fieldName.substring(firstDelim + 1, secondDelim);
        var detID = fieldName.substr(secondDelim + 1);

        if ($('#TimeIn_' + attID + '_' + detID).val() && $('#TimeOut_' + attID + '_' + detID).val()) {
            $(".attendance_detail_hours").attr("readonly", "readonly");
        }
        else {
            $(".attendance_detail_hours").removeAttr("readonly");
        }

        //Default to AM if TimeIn field with no AM/PM
        if ((fieldName == 'TimeIn_' + attID + '_' + detID) &&
            (val.toString().toLowerCase().indexOf('am')== -1 && val.toString().toLowerCase().indexOf('pm') == -1))
            val = val + 'AM';

        $(this).val($APP.Forms.Formats.formatTime(val));
        calculateHours(this);
    });

    //Auto-calculate total hours based on time in/out or hours
    $(scope).find('.attendance_detail_time, .attendance_detail_hours').bind('blur', function (event) {
        var fieldName = this.id;

        var firstDelim = fieldName.indexOf('_');
        var secondDelim = fieldName.substr(firstDelim + 1).indexOf('_') + firstDelim + 1;
        var attID = fieldName.substring(firstDelim + 1, secondDelim);

        //format hours to decimal
        if (fieldName.indexOf("Hours") >= 0) {
            $(this).val($APP.Forms.Formats.formatCurrency($(this).val()).replace("$", ""))
            resetCareTime($("#" + fieldName).val(), attID);
        }

        calculateTotalHours(attID);
    });
}

function registerNewDetail(scope) {

    $APP.registerNewContent(scope);
    $APP.UI.hideLoading(scope);

    //reset classroom to be blank by default
    $(scope).find('.new_attendance_detail').each(function (index) {
        if ($(this).hasClass("attendance_detail_classroom"))
           $(this).val(0)
    });

    $(scope).find('.new_attendance_detail').bind('blur', function (event) {
        var fieldName = this.id.replace(/_New/, '');
        var delimPos = fieldName.indexOf('_');
        var attID = fieldName.substr(delimPos + 1);
        var attDate = $("#AttendanceDate_" + attID).val();
        var absTypeID = $("#AbsenceTypeID_" + attID).val();

        var currentTimeInID = 'TimeIn_' + attID + '_New';
        var currentTimeOutID = 'TimeOut_' + attID + '_New';
        var currentHoursID = 'Hours_' + attID + '_New';
        var currentProgramID = 'ProgramID_' + attID + '_New';
        var currentClassroomID = 'ClassroomID_' + attID + '_New';
        var currentCounter = parseInt($('#DetailCounter_' + attID).val());
        //format time in and time out ID's
        $('#' + currentTimeOutID).val($APP.Forms.Formats.formatTime($('#' + currentTimeOutID).val()));
        $('#' + currentTimeOutID).val($APP.Forms.Formats.formatTime($('#' + currentTimeOutID).val()));


        if (($('#' + currentTimeInID).val() != '' && $('#' + currentTimeOutID).val() != '' || $('#' + currentHoursID).val() != '') &&
            ($('#' + currentProgramID).val() != "0" && fieldName.indexOf("ClassroomID") >= 0)) { //classroom check added to make sure user entered all the prior fields

            if (($('#' + currentTimeInID).val() != '' && $('#' + currentTimeOutID).val() != '')) {
                calculateHours($('#' + currentTimeInID).get(0));
            }

            var currentRow = $('#' + currentTimeInID).parent().parent();

            var url = currentRow.data('url');
            url = url.replace('=TimeIn', '=' + $('#' + currentTimeInID).val());
            url = url.replace('=TimeOut', '=' + $('#' + currentTimeOutID).val());
            url = url.replace('=Hours', '=' + $('#' + currentHoursID).val());
            url = url.replace('=ProgramID', '=' + $('#' + currentProgramID).val());
            url = url.replace('=ClassroomID', '=' + $('#' + currentClassroomID).val());
            url = url.replace('=Counter', '=' + currentCounter);

            if (absTypeID > 0) {
                //validate  best interest and unexcused days
                $.ajax({
                    url: root + 'AttendanceTracking/AttendanceEntry/ValidateAbsence',
                    data: "ChildID=" + $("#ChildID").val() + "&AbsenceTypeID=" + absTypeID + "&AbsenceDate=" + attDate,
                    cache: false,
                    success: function (data) {

                        if (data.bestInterestIsValid == "False") {

                            $APP.UI.Confirm({
                                id: "confirm_duplicate",
                                message: "<strong>This will exceed the maximum number of best interest days (" + data.maxBestInterest + ") for the current fiscal year. <br><br> Are you sure you wish to save this absence?</strong>",
                                importance: 'high',
                                onConfirm: function () {

                                    $.post(url, function (data) {
                                        var replacementRows = data;
                                        $.get(root + 'AttendanceTracking/AttendanceEntry/DetailNew', 'attendanceID=' + attID, function (newData) {
                                            replacementRows += newData;

                                            replacementRows = $(replacementRows);
                                            currentRow.replaceWith(replacementRows);

                                            registerNewDetail(replacementRows);
                                            registerDetail(replacementRows);

                                            $('#DetailCounter_' + attID).val(currentCounter + 1);
                                        });
                                    });
                                }
                            });

                        } else if (data.unexcusedIsValid == "False") {

                            APP.UI.Confirm({
                                id: "confirm_duplicate",
                                message: "<strong>This will exceed the maximum number of unexcused paid absence days (" + data.maxUnexcused + ") for the current fiscal year.  Are you sure you wish to save this absence?</strong>",
                                importance: 'high',
                                onConfirm: function () {

                                    $.post(url, function (data) {
                                        var replacementRows = data;
                                        $.get(root + 'AttendanceTracking/AttendanceEntry/DetailNew', 'attendanceID=' + attID, function (newData) {
                                            replacementRows += newData;

                                            replacementRows = $(replacementRows);
                                            currentRow.replaceWith(replacementRows);

                                            registerNewDetail(replacementRows);
                                            registerDetail(replacementRows);

                                            $('#DetailCounter_' + attID).val(currentCounter + 1);
                                        });
                                    });
                                }
                            });

                        } else {

                            $.post(url, function (data) {
                                var replacementRows = data;
                                $.get(root + 'AttendanceTracking/AttendanceEntry/DetailNew', 'attendanceID=' + attID, function (newData) {
                                    replacementRows += newData;

                                    replacementRows = $(replacementRows);
                                    currentRow.replaceWith(replacementRows);

                                    registerNewDetail(replacementRows);
                                    registerDetail(replacementRows);

                                    $('#DetailCounter_' + attID).val(currentCounter + 1);
                                });
                            });
                        }
                    }
                });
            } else {
                $.post(url, function (data) {
                    var replacementRows = data;
                    $.get(root + 'AttendanceTracking/AttendanceEntry/DetailNew', 'attendanceID=' + attID, function (newData) {
                        replacementRows += newData;

                        replacementRows = $(replacementRows);
                        currentRow.replaceWith(replacementRows);

                        registerNewDetail(replacementRows);
                        registerDetail(replacementRows);

                        $('#DetailCounter_' + attID).val(currentCounter + 1);
                    });
                });
            }
        }
    });
}

function handleAbsence(absenceTypeSelect) {
    var attID = absenceTypeSelect.id.replace('AbsenceTypeID_', '');
    var abstypeVal = $(absenceTypeSelect).val();
    var currentRow = $(absenceTypeSelect).parent().parent();

    if ($(absenceTypeSelect).val() == 0) {

        $('.attendance_detail_row_' + attID).show();
        currentRow.find('.attendance_entry_data_field').removeAttr('readonly');
        $('#DetailCounter_' + attID).val(1);

    } else {
        $.get(root + 'AttendanceTracking/Entry/AbsenceEnableAttendance', 'absenceTypeID=' + $(absenceTypeSelect).val() + '&providerID=' + $('#ProviderID').val(), function (result) {
            if (result.enable == true) {
                
                $('.attendance_detail_row_' + attID).show();
                currentRow.find('.attendance_entry_data_field').removeAttr('readonly');
                $('#DetailCounter_' + attID).val(1);
            } else {
                var htmlRef = $('.attendance_detail_row_' + attID)
                $(htmlRef).hide();

                //remove detail records
                $(htmlRef).each(function (index) {
                    if (!$(this).hasClass("new_row"))
                        $(this).remove();
                });

                //clear fields
                clearAllInputs($(currentRow));
                clearAllInputs($(htmlRef));

                $(currentRow).find('.absence_type').val(abstypeVal);
                $('#DetailCounter_' + attID).val(0);
            }
        });
        unselectMeals(attID);
    }
}


function clearAllInputs(selector) {
    $(selector).find(':input').each(function() {
        if(this.type == 'submit' || this.type=='hidden'){
            //do nothing
        }
        else if(this.type == 'checkbox' || this.type == 'radio') {
            this.checked = false;
        }
        else if(this.type == 'file'){
            var control = $(this);
            control.replaceWith( control = control.clone( true ) );
        }else{
            $(this).val('');
        }
    });
}
function unselectMeals(attID) {
    $("#Snack_" + attID).attr('checked', false);
    $("#Breakfast_" + attID).attr('checked', false);
    $("#Lunch_" + attID).attr('checked', false);
    $("#Dinner_" + attID).attr('checked', false);
}


function calculateHours(timeField) {
    var fieldName = timeField.id;
    var firstDelim = fieldName.indexOf('_');
    var secondDelim = fieldName.substr(firstDelim + 1).indexOf('_') + firstDelim + 1;

    var attID = fieldName.substring(firstDelim + 1, secondDelim);
    var detID = fieldName.substr(secondDelim + 1);

    if ($('#TimeIn_' + attID + '_' + detID).val() && $('#TimeOut_' + attID + '_' + detID).val()) {

        var timeIn = $('#TimeIn_' + attID + '_' + detID).val().toString().replace(":", " ").split(" ");
        var timeOut = $('#TimeOut_' + attID + '_' + detID).val().toString().replace(":", " ").split(" ");
        var hours;

        //set hours in 24 hour format
        if (timeIn[2].match(/PM/i)) {
            //convert just hours to 24hr format
            if (parseInt(timeIn[0]) < 12)
                timeIn[0] = (parseInt(timeIn[0]) + 12);
        }
        else { //AM
            if (parseInt(timeIn[0]) == 12)
                timeIn[0] = "0";
        }

        if (timeOut[2].match(/PM/i)) {
            //convert just hours to 24hr format
            if (parseInt(timeOut[0]) < 12)
                timeOut[0] = (parseInt(timeOut[0]) + 12);
        }
        else { //AM
            if (parseInt(timeOut[0]) == 12)
                timeOut[0] = "0";
        }
        //convert min from 60 to 100
        timeIn[1] = parseFloat(timeIn[1]) / 60;
        timeOut[1] = parseFloat(timeOut[1]) / 60;

        // accommodate graveyard and an entire day time
        if (parseInt(timeIn[0]) > parseInt(timeOut[0]) && timeOut[2].toLowerCase() == timeOut[2].toLowerCase()) {
            timeOut[0] = (parseInt(timeOut[0]) + 24);
            hours = parseFloat(parseInt(timeOut[0]) - parseInt(timeIn[0])) + parseFloat(parseFloat(timeOut[1]) - parseFloat(timeIn[1]));
        }
        else {
            hours = parseFloat(parseInt(timeOut[0]) - parseInt(timeIn[0])) + parseFloat(parseFloat(timeOut[1]) - parseFloat(timeIn[1]));
        }

        //hours = parseFloat(parseInt(timeOut[0]) - parseInt(timeIn[0])) + parseFloat(parseFloat(timeOut[1]) - parseFloat(timeIn[1]));

        if (hours != NaN) {
            $('#Hours_' + attID + '_' + detID).val(hours.toFixed(2));
            resetCareTime(hours.toFixed(2), attID)
        }
    }
}

function calculateTotalHours(attID) {
    var totalHours = 0.00;
    $('tr.attendance_detail_row_' + attID).find('.attendance_detail_hours').each(function (index) {
        if ($(this).val()) {
            var hours = $(this).val();
            if (hours != NaN && hours > 0) {
                totalHours += parseFloat(hours);
            }
        }
    });

    $('#TotalHours_' + attID).val((totalHours > 0) ? totalHours : "");
    resetCareTime(totalHours, attID);
}

function resetCareTime(hrs, attID) {

    if (hrs != "") {
        $.ajax({
            url: root + 'AttendanceTracking/AttendanceEntry/RestCaretime/',
            cache: false,
            data: "Hours=" + hrs,
            success: function (data) {
                $('#AttendanceTypeID_' + attID).val(data.caretimeID);

            }
        });
    }
}

//Populate child name
function getChildName(childID) {
    $.get('Entry/PopulateChildName', 'childID=' + childID, function (data) {
        $('#ChildName').html(data);
    });
}

//Populate provider name
function getProviderName(providerID, classroomID) {
    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/PopulateProviderName_Classroom/',
        cache: false,
        data: "ProviderID=" + providerID,
        success: function (data) {
            $("#providerName").html(data.name);
            var classRoomCntrlName = ($("#View").val() == 4) ? 'ClassroomIDCriteria' : 'ClassroomID_Criteria';

            $('#' + classRoomCntrlName).empty();
            $('#' + classRoomCntrlName).append('<option value=""></option>');
            $('#' + classRoomCntrlName).append('<option value="0">All</option>');
            $.each(data.classrooms, function (i, obj) {
                $('#' + classRoomCntrlName).append('<option value="' + obj.id + '">' + obj.name + '</option>');
            });
            $('#' + classRoomCntrlName).load();
            $('#' + classRoomCntrlName).val(classroomID);

            //if ($("#View").val() == 4)
            //    childListingSummary();
            //else
                showDetail_Daily();
        }
    });
}
//Populate provider list
function getProviderList() {
    $.get('Entry/PopulateProviderList',
        $('#AttendanceEntryForm').serialize(),
        function (data) {
            $('#ProviderID').html(data);
            $('#ProviderID').val($("#ProviderID_Criteria").val());
        });
}

//Get search selection
function returnChildSearchSelection(childID) {
    $('#ChildID').val(childID);
    getChildName(childID);
    getProviderList();

    $('#child_search').remove();
    $APP.UI.Lightbox.hide();
}

//Cancel search - close search form
function cancelChildSearch() {
    $('#child_search').remove();
    $APP.UI.Lightbox.hide();
}

//Get search selection
function returnProviderSearchSelection(providerID) {

    if ($("#View").val() == 4 || $("#View").val() == 3)
        $('#ProviderID_Criteria').val(providerID);
    else
        $('#ProviderID').val(providerID);

    getProviderName(providerID);

    $('#provider_search').remove();
    $APP.UI.Lightbox.hide();
}

//Cancel search - close search form
function cancelProviderSearch() {
    $('#provider_search').remove();
    $APP.UI.Lightbox.hide();
}

// List requerying function
function requeryList(listSelector, newListData) {
    var select = listSelector;
    var options;
    if (select.prop) {
        options = select.prop('options');
    }
    else {
        options = select.attr('options');
    }

    $('option', select).remove();

    $.each(newListData, function (val, text) {
        if (text != null)
            options[options.length] = new Option(text, val);
    });
}

////////////////////////////////////////////////////////////////////////////
//  FUNCTIONS FOR CHILD LISTING (EXPANDABLE And LISTING VIEW)
///////////////////////////////////////////////////////////////////////////

function childListingSummary(calledFrom) {

    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/ChildListingSummary/',
        cache: false,
        data: "ProviderID=" + $("#ProviderID_Criteria").val() + "&ClassroomID=" + $("#ClassroomIDCriteria").val() + "&StartDate=" + $("#StartDate_Criteria").val() + "&StopDate=" + $("#StopDate_Criteria").val() + "&AttendanceEntered=" + $("#AttendanceEntered").val(),
        success: function (data) {
            var html = $(data);

          //  if (calledFrom == "calculate") {
                $(".child_search_results").html(html)
                $APP.registerNewContent(html);
                //$APP.UI.hideLoading(scope);

                //TOGGLE PER CHILD (EXPANDABLE VIEW)
                $('#att_entry_children_listing table#children_information_detail tr.summary_row').bind('click', function (event) {
                    // Make sure this isn't invoked if the user clicked on a link inside of the TR we've targeted
                    if (event.target.tagName != 'A') {
                        toggleRow(this);
                    }
                });
            //}
            //else {
            //    $(".child_search_results").html(html);
            // //   registerChildListing();
            //    $APP.registerNewContent(html);
            //}
        }
    });
}


var toggleRow = function (row) {
    var childID = $(row).attr('id').replace(/childListing_summary_/, '');
    var view = $("#View").val();

    if (!$(row).hasClass('selected') && $('tr#att_children_listing_detail_' + childID + ' td').html().length == 0) {
        $('tr#att_children_listing_detail_' + childID).show();

        $APP.UI.showLoading($('.child_search_results'));

        $.ajax({
            url: root + 'AttendanceTracking/AttendanceEntry/ShowDetail',
            data: "childID=" + childID + "&providerID=" + $("#ProviderID_Criteria").val() + "&startDate=" + $("#StartDate_Criteria").val() + "&stopDate=" + $("#StopDate_Criteria").val() + "&classroomID=" + $("#ClassroomIDCriteria").val() + "&AttView=" + view,
            cache: false,
            type: "Post",
            success: function (data) {

                $('tr#att_children_listing_detail_' + childID + ' td').html(data);
                 registerDetail('tr#att_children_listing_detail_' + childID + ' td');
                 registerNewDetail('tr#att_children_listing_detail_' + childID + ' td');
                 $APP.UI.hideLoading($('.child_search_results'));
            }
        });
    } 
}

function showDetail_BulkListing() {

    var IDs = $("#att_entry_children_listing tbody tr.summary_row").map(function () { return $(this).attr("id").replace("childListing_summary_", "") }).get();

    $APP.UI.showLoading($('.child_search_results'));

    for (var i = 0; i < IDs.length; i++) {

        var ChildID = IDs[i];

        $.ajax({
            url: root + 'AttendanceTracking/AttendanceEntry/ShowDetail',
            data: "childID=" + ChildID + "&providerID=" + $("#ProviderID_Criteria").val() + "&startDate=" + $("#StartDate_Criteria").val() + "&stopDate=" + $("#StopDate_Criteria").val() + "&classroomID=" + $("#ClassroomIDCriteria").val(),
            cache: false,
            type: "Post",
            //async: false,
            success: function (data) {

                $('tr#att_children_listing_detail_' + ChildID + ' td').html(data);
                registerDetail('tr#att_children_listing_detail_' + ChildID + ' td');
                registerNewDetail('tr#att_children_listing_detail_' + ChildID + ' td');
            }
        });

        if (i == IDs.length - 1)
            $APP.UI.hideLoading($('.child_search_results'));
    }
}

function submitBulk() {

    $APP.UI.showLoading($('.child_search_results'));

    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/SubmitAttendanceBulk/',
        data: $('#AttendanceDisplay').serialize(),
        cache: false,
        type: 'post',
        success: function (data) {
            if (data.success == 0) {
                var msg = 'Attendance data has already been submitted for the criteria you have entered.  To submit new information, please delete this attendance data from Attendance History.';
                var confirmDialog = $APP.UI.Confirm({
                    id: "security_message",
                    message: "<strong>" + msg + "</strong>",
                    showNoButton: false,
                    yesLabel: 'OK'
                });
                confirmDialog.show();
                $APP.UI.hideLoading($('.child_search_results'));

            } else if (data.success == -1) {
                var confirmDialog = $APP.UI.Confirm({
                    id: "error_message",
                    message: "<strong> " + data.message + "</strong><br \><br \>",
                    showNoButton: false,
                    yesLabel: 'OK'
                });
                confirmDialog.show();
                $APP.UI.hideLoading($('.child_search_results'));

            } else if (data.success == -2) {
                var confirmDialog = $APP.UI.Confirm({
                    id: "error_message",
                    message: "<strong> Please enter Attendance before submitting.</strong><br \><br \>",
                    showNoButton: false,
                    yesLabel: 'OK'
                });
                confirmDialog.show();
                $APP.UI.hideLoading($('.child_search_results'));

            }else {
                clearInputsFieldsBulk();
                $APP.UI.hideLoading($('.child_search_results'));
            }
        }
    });
}

function emptyToggleRow() {
    var IDs = $("#att_entry_children_listing tbody tr.summary_row").map(function () { return $(this).attr("id").replace("childListing_summary_", "") }).get();

    for (var i = 0; i < IDs.length; i++) {
        $('tr#att_children_listing_detail_' + IDs[i] + ' td').html('');
    }
}


function registerChildListing() {
    //populate childlisting
    $("#ProviderID_Criteria, #ClassroomID_Criteria, #ClassroomIDCriteria, #AttendanceEntered").bind("change", function (event) {

        if ($("#View").val() == 4) {

            //find the cntrl that trigger this event
            var id = $(this).attr("id");
            var val = $(this).val();

            if (id == 'ProviderID_Criteria') {
                $(".child_search_results").html("");
                getProviderName($(this).val());
            }
            else if (id == 'ClassroomIDCriteria') {
                if(val != ""){
                    $('#calculate_ChildListing_attendance_button').css('opacity', '');
                    $("#id_calculate_ChildListing_attendance_button").removeAttr("disabled");
                    $('#submit_childListing_attendance_button').css('opacity', '');
                    $("#id_submit_childListing_attendance_button").removeAttr("disabled");
                    childListingSummary();
                } else {
                    $('#calculate_ChildListing_attendance_button').css('opacity', '0.5');
                    $("#id_calculate_ChildListing_attendance_button").attr("disabled", true);
                    $('#submit_childListing_attendance_button').css('opacity', '0.5');
                    $("#id_submit_childListing_attendance_button").attr("disabled", true);
                }
            }else{
                childListingSummary();
            }

        } else {
            if (!$("#ProviderID_Criteria").val().match(/^\d+$/)) {
                alert("Please enter a numeric value for Provider ID.");
            }
            else {
                refreshChildListing();
            }
        }
      
    });

    //Set stop date if start date changes
    $('#StartDate_Criteria').bind('change', function (event) {
        var startDate = new Date($APP.Forms.Formats.formatDate($('#StartDate_Criteria').val()));
        var stopDate = startDate.moveToLastDayOfMonth();

        if (startDate instanceof Date && !isNaN(startDate.valueOf())) { //check to see if start date is a valid date
            $('#StopDate_Criteria').val(stopDate.toString("M/d/yyyy"));
            $('#StartDate_Criteria').val($APP.Forms.Formats.formatDate($('#StartDate_Criteria').val()));
            $("#StartDate").val($APP.Forms.Formats.formatDate($('#StartDate_Criteria').val()));
            $("#StopDate").val($('#StopDate_Criteria').val());
            $('#ProviderID_Criteria').change();
        }
        else {
            $('#StopDate_Criteria').val("");
        }
    });

    $('#StopDate_Criteria').bind('change', function (event) {
        $("#StopDate").val($APP.Forms.Formats.formatDate($(this).val()));
    });

    if ($("#View").val() == 4) {
        //CALCULATE FOR ALL CHILD LISTING (EXPANDABLE VIEW)
        $("#calculate_ChildListing_attendance_button").bind("click", function (event) {
            event.preventDefault();

            if ($("#ClassroomIDCriteria").val() != ""){
                emptyToggleRow();

                $.ajax({
                    url: root + 'AttendanceTracking/AttendanceEntry/CalculateBulkAttendance',
                    data: "ClassroomID=" + $("#ClassroomIDCriteria").val() + "&ProviderID=" + $("#ProviderID_Criteria").val() + "&StartDate=" + $("#StartDate_Criteria").val() + "&StopDate=" + $("#StopDate_Criteria").val(),
                    cache: false,
                    type: "Post",
                    success: function (data) {
                        childListingSummary("calculate");

                    }
                });
            }
        });

        //SUMBIT FOR ALL CHILD LISTING (EXPANDABLE VIEW)
        $("#submit_childListing_attendance_button").bind('click', function (event) {
            event.preventDefault()
            if ($("#ClassroomIDCriteria").val() != "") {
                submitBulk();
            }
        })
        //CLEAR FOR ALL CHILD LISTING (EXPANDABLE VIEW)
        $("#clear_ChildListing_attendance_button").bind("click", function (event) {
            event.preventDefault()

            $APP.UI.showLoading($('.child_search_results'));

            $.ajax({
                url: root + 'AttendanceTracking/AttendanceEntry/ClearBulk/',
                data: "ProviderID=" + $("#ProviderID_Criteria").val() + "&ClassroomID=" + $("#ClassroomIDCriteria").val() + "&StartDate=" + $("#StartDate_Criteria").val() + "&StopDate=" + $("#StopDate_Criteria").val(),
                cache: false,
                success: function (data) {
                    childListingSummary();
                    $APP.UI.hideLoading($('.child_search_results'));
                }
            });
        })
    }


} //End of registerChildListing

function refreshChildListing() {
    $.ajax({
        url: root + 'AttendanceTracking/AttendanceEntry/ChildListingResult/',
        cache: false,
        data: "ProviderID=" + $("#ProviderID_Criteria").val() + "&ClassroomID=" + $("#ClassroomID_Criteria").val() + "&StartDate=" + $("#StartDate_Criteria").val() + "&StopDate=" + $("#StopDate_Criteria").val() + "&AttendanceEntered=" + $("#AttendanceEntered").val(),
        success: function (data) {

            var selectedClassRoomID = $("#ClassroomID_Criteria").val();
            $("#providerName").html(data.providerName);
            $('#ClassroomID_Criteria').empty();
            $('#ClassroomID_Criteria').append('<option value=""></option>');
            $('#ClassroomID_Criteria').append('<option value="0">All</option>');
            $.each(data.classrooms, function (i, obj) {
                $('#ClassroomID_Criteria').append('<option value="' + obj.id + '">' + obj.name + '</option>');
            });
            $('#ClassroomID_Criteria').load();
            $("#ClassroomID_Criteria").val(selectedClassRoomID);

            //populate child listing
            $('#child_search_results table tbody').html("");
            $('#child_search_results .scroll').height('150px');

            $.each(data.childListing, function (i, item) {
                var url = root + "CaseManagement/Child/Show/" + data.childListing[i].id;

                $('<tr>').html("<td width='10%'>" + data.childListing[i].id + "</td>" +
                               "<td width='27%'><a id=" + data.childListing[i].id + " class=child_listing_link href=" + url + ">" + data.childListing[i].name + "</a></td>" +
                               "<td width='27%'>" + data.childListing[i].programName + "</td>" +
                               "<td>" + (data.childListing[i].AttendanceEntered == null ? "" : data.childListing[i].AttendanceEntered) + "</td>"
                               ).appendTo('#child_search_results_tbl');
            });

            //register links for the child list
            $('.child_listing_link').bind('click', function (event) {
                event.preventDefault();
                var childID = $(this).attr("id");
                $("#ChildID").val(childID);
                $("#ChildID").blur();
                $("#ProviderID").val($("#ProviderID_Criteria").val());
                $('#calculate_attendance_button').click();
                $("#child_listing_form").hide();
                $APP.UI.Lightbox.hide();
            });
        }
    });
}