//Set stop date if start date changes
$('#StartDate').bind('change', function (event) {
    var startDate = new Date($APP.Forms.Formats.formatDate($('#StartDate').val()));
    var stopDate = startDate.moveToLastDayOfMonth();
    $('#StopDate').val(stopDate.toString("M/d/yyyy"));
});

function showDetail() {
    //if ($('#ChildID').val() && $('#ProviderID').val() && $('#StartDate').val() && $('#StopDate').val()) {
        $.get('History/ShowDetail', $('#AttendanceHistoryForm').serialize(), function (data) {
            $('#attendance_history_detail').html(data);

            var hasDeleteRights = $('#attendance_history_detail').find("#HasDeleteRights").val();

            if (hasDeleteRights ==0)
                $("#delete_attendance_button").css("display", "none");
            else
                $("#delete_attendance_button").css("display","block");

            registerDetail(document);
        });
    //}
}

function showDetail_Daily(){

    $APP.UI.showLoading($('#attendance_history_detail'));

    $.ajax({
        url: root + 'AttendanceTracking/AttendanceHistory/ShowDetail_Daily/',
        cache: false,
        data: "ChildID=" + $("#ChildID").val() + "&ProviderID=" + $("#ProviderID").val() + "&ClassroomID=" + $("#ClassroomID_Criteria").val() + "&AttendanceDate=" + $("#AttendanceDate").val(),
        success: function (data) {

            $('#attendance_history_detail').html(data);
            registerDetail($('#attendance_history_detail'));

            $APP.UI.hideLoading($('#attendance_history_detail'));

        }
    });
}


//If child, provider, start date, and stop date are entered, return detail
$('#ChildID, #ProviderID, #StartDate, #StopDate, #ClassroomID_Criteria, #AttendanceDate').bind('blur', function (event) {
    event.preventDefault();

    if ($("#View").val() == 2) {

        getChildName($('#ChildID').val());
        getProviderName($("#ProviderID").val(), $("#ClassroomID_Criteria").val());
        showDetail_Daily();
    }
    else
        showDetail();
});


$('#id_filter_attendance_button').bind('click', function (event) {
    event.preventDefault();

    if ($("#View").val() == 2) 
        showDetail_Daily();
    else
        showDetail();
});

//Populate provider list based on entries in child ID, start date, and stop date
$('#ChildID, #StartDate, #StopDate').bind('blur', function(event) {
    getProviderList();
});

//Populate child name based on child ID
$('#ChildID').bind('blur', function(event) {
    getChildName($('#ChildID').val());
});

//Override search link behavior
$('#show_child_search').bind('click', function(event) {
    event.preventDefault();

    showChildSearchForm('child_search', 'Child Search');
});

//Override search link behavior
$('#show_provider_search').bind('click', function (event) {
    event.preventDefault();

    showProviderSearchForm('provider_search', 'Provider Search');
});

//Replace delete link when Delete button is clicked
$('#delete_attendance_button').bind('click', function (event) {
    event.preventDefault();

    if ($('#ChildID').val() && $('#ProviderID').val() && $('#StartDate').val() && $('#StopDate').val()) {

        var hasDeleteRights = $("#HasDeleteRights").val();

        if (hasDeleteRights == 0) {
            var confirmDialog = $APP.UI.Confirm({
                id: "error_message",
                message: "<strong> You do not have rights to delete this attendance.</strong><br \><br \>",
                showNoButton: false,
                yesLabel: 'OK'
            });
            confirmDialog.show();
        }else{
            var deleteButton = this;

            $.get(root + 'AttendanceTracking/AttendanceHistory/DeleteDateCriteria/', function (data) {
                var deleteDate = new $APP.UI.Dialog({
                    id: 'deleteDate_dialog',
                    title: 'Delete Attendance History',
                    titleColor: 'green',
                    width: '50%',
                    lightbox: true,
                    iconURL: assets.images + 'icons/edit_16.png',
                    content: data,
                    shadow: true
                });
                deleteDate.show();
            });
    }
}
});

function registerDetail(scope) {

$(scope).find('.delete_attendance_history').bind('click', function (event) {
        event.preventDefault();

        var attendanceId = $(this).attr("id");

        $APP.UI.Confirm({
            id: "confirm_delete",
            message: "<strong>Are you sure you wish to delete this attendance entry?</strong>",
            importance: 'high',
            onConfirm: function () {
                if ($("#AccountClosingDate").val() != "" && (new Date($("#AttendanceDate").val()) <= new Date($("#AccountClosingDate").val()))) {
                    alert("Attendance history dated prior to the Accounting Closing Date of "+ $("#AccountClosingDate").val() +" cannot be deleted. The Accounting Closing Date is set in System Options.");
                }
                else{
                $.ajax({
                    url: root + 'AttendanceTracking/AttendanceHistory/DeleteDaily/',
                    cache: false,
                    data: "AttendanceID="+attendanceId,
                    success: function (data) {
                        showDetail_Daily();
                    },
                    error: function (xhr, status, error) {
                        alert(xhr.responseText.match(/.*<body.*>([\s\S]*)<\/body>.*/));
                    }
                });
            }
        }
            });
    });
}

//Populate child name
function getChildName(childID) {
    $.get('History/PopulateChildName',
        'childID=' + childID,
        function(data) {
            $('#ChildName').html(data);
        });
}

//Populate provider name
function getProviderName(providerID, classroomID) {
    $.ajax({
        url: root + 'AttendanceTracking/AttendanceHistory/PopulateProviderName_Classroom/',
        cache: false,
        data: "ProviderID=" + providerID,
        success: function (data) {
            $("#providerName").html(data.name);
            $('#ClassroomID_Criteria').empty();
            $('#ClassroomID_Criteria').append('<option value=""></option>');
            $.each(data.classrooms, function (i, obj) {
                $('#ClassroomID_Criteria').append('<option value="' + obj.id + '">' + obj.name + '</option>');
            });
            $('#ClassroomID_Criteria').load();
            $('#ClassroomID_Criteria').val(classroomID);
            showDetail_Daily();
        }
    });
}
//Populate provider list
function getProviderList() {
    $.get('History/PopulateProviderList',
        $('#AttendanceHistoryForm').serialize(),
        function(data) {
            $('#ProviderID').html(data);
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

function registerReports() {
    $('#print_monthly_attendance_billing_report_button').bind('click', function (event) {
        event.preventDefault();

        var reportForm = $APP.findParentByElementType(this, "form");
        $APP.Reports.print(reportForm, root + 'Reports/MonthlyAttendanceBillingReport/DisplayReport');
    });

    $('#print_attendance_history_report_button').bind('click', function (event) {
        event.preventDefault();

        var reportForm = $APP.findParentByElementType(this, "form");
        $APP.Reports.print(reportForm, root + 'Reports/AttendanceHistoryReport/DisplayReport');
    });
}
registerReports();