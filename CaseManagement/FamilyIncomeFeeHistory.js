//*************************************************************************
// Reports popup
//*************************************************************************

function registerReports() {
    $('.print_income_worksheet_button').bind('click', function (event) {
        event.preventDefault();

        alert("registerReports");
        //var reportForm = $APP.findParentByClassName(this, "html_panel_divider");
        //var reportCriteriaForm = $APP.Forms.clone($(reportForm));

        //reportCriteriaForm.css('display', 'none');

        var reportFrame = '<div id="report_frame"></div>';
        var reportFrameTemplate = $('#report_frame_template').detach();

        var reportPopup = new $APP.UI.Dialog({
            id: 'report_popup',
            title: 'Report Viewer',
            titleColor: 'blue',
            width: '100%',
            height: '600px',
            lightbox: true,
            iconURL: assets.images + 'icons/edit_16.png',
            content: reportFrame,
            shadow: true
        });

        reportPopup.show();

        reportFrame = $('#report_frame');
        reportFrame.append($(reportFrameTemplate.html()));

        var userAgent = window.navigator.userAgent.toString();

        if (userAgent.indexOf('Safari') != -1) {

            // Code specific to safari

            var reportContent = $('<iframe />').load(function () {
                var iframeRef = reportFrame.find('iframe');
                iframeRef.unbind('load');
                //iframeRef.contents().find('body').append(reportCriteriaForm);

                $APP.registerNewContent(reportFrame);

                $APP.UI.showLoading(reportFrame.find('.loading_container'));
                iframeRef.contents().find('form').submit();

                iframeRef.load(function (event) {
                    iframeRef.unbind('load');
                    $APP.UI.hideLoading(reportFrame.find('.loading_container'));
                    reportFrame.find('.loading_container').remove();

                    if (iframeRef.contents().find('.validation_error_summary ').length > 0) {
                        alert('There were problems with the criteria you submitted.');
                        reportPopup.hide();
                    } else {
                        iframeRef.contents().find('embed').focus();
                    }
                });
            });
            reportFrame.find('.report_content').html(reportContent);

        } else {

            // All other browsers

            reportFrame.find('iframe').load(function (event) {
                var iframeRef = reportFrame.find('iframe');
                iframeRef.unbind('load');
                //iframeRef.contents().find('body').append(reportCriteriaForm);
                $APP.registerNewContent(reportFrame);

                $APP.UI.showLoading(reportFrame.find('.loading_container'));
                reportFrame.find('.loading_container').remove();

                iframeRef.contents().find('form').submit();

                iframeRef.load(function (event) {

                    iframeRef.unbind('load');
                    $APP.UI.hideLoading(reportFrame.find('.loading_container'));

                    if (iframeRef.contents().find('.validation_error_summary ').length > 0) {
                        alert('There were problems with the criteria you submitted.');
                        reportPopup.hide();
                    } else {
                        iframeRef.contents().find('embed').focus();
                    }
                });

            });

        }

    });
}
registerReports();

/*
*FUNCTION NEEDED TO GENERATE FAMILYNOA
*/
function checkTypeOfNOAGeneration() {

    var effectiveDate;
    var familyID = $("#FamilyID").val();
    var templateCountIncomeChange = $("#NOATemplateCountIncomeChange").val();
    var templateCountnewIncome = $("#NOATemplateCountNewIncome").val();
    var incomeChanged = $("#IncomeChanged").val();
    var familySizeChanged = $("#FamilySizeChanged").val();
    var feeTypeChanged = $("#FeeTypeChanged").val();
    var initailIncome = $("#InitailIncome").val();


    //setup default effective date for NOA based on sys option
    if ($("#DefaultNOAEffectiveDate").val() == 1)
        effectiveDate = $("#EffectiveDate").val();
    else
        effectiveDate = $("#FamilyFeeEffectiveDate").val();

            //needed to generate noa


    if (incomeChanged == "True" || familySizeChanged == "True" || feeTypeChanged == "True") {
                // alert("update: " + familyID + " " + effectiveDate + " " + templateCountIncomeChange);
                setUpNOAGeneration(familyID, effectiveDate, templateCountIncomeChange, false, "01");
            }
            else if (initailIncome == "True") {
                //alert("create: "+familyID + " " + effectiveDate + " " + templateCountnewIncome);
                setUpNOAGeneration(familyID, effectiveDate, templateCountnewIncome, true, "05");
            }
}

function setUpNOAGeneration(familyID, effectiveDate, templateCount, newIncomeRecord, noaCategoryCode) {

    var strMsg = (newIncomeRecord == true) ? "Do you wish to generate an initial income assessment NOA?" : "Do you wish to generate a change of income NOA?";
    $.ajax({
        url: root + 'CaseManagement/Family/' + $('#FamilyID').val() + '/IncomeFee/GenerateNOAOption/',
        data: "NewIncomeRecord=" + newIncomeRecord, 
        cache: false,
        success: function (data) {
            if (data.option == 2) {

                $APP.UI.Confirm({
                    id: "confirm_clear",
                    message: strMsg,
                    importance: 'high',
                    onConfirm: function () {
                        checkNOATemplate(data.option, familyID, effectiveDate, noaCategoryCode, templateCount, newIncomeRecord);
                    }
                });
            }
            else if (data.option == 1)
                checkNOATemplate(data.option, familyID, effectiveDate, noaCategoryCode, templateCount, newIncomeRecord);
        }
    });
}

function checkNOATemplate(generateNOAOption, familyID, effectiveDate, noaCategoryCode, templateCount, newIncomeRecord) {

    switch (templateCount) {
        case "0":
            var strMsg = (newIncomeRecord == true) ? "There are no NOA Templates set up for new schedules NOA Templates" : "There are no NOA Templates set up for change of income.";
            alert(strMsg);
            break;
        case "1":
            generateNOA(generateNOAOption, familyID, effectiveDate, noaCategoryCode, 0, newIncomeRecord);
            break;
        default:
            $.ajax({
                url: root + 'CaseManagement/Family/' + $('#FamilyID').val() + '/IncomeFee/NOATemplateSelection/',
                data: "familyID=" + familyID + "&EffectiveDate=" + effectiveDate + "&NOACategoryCode=" + noaCategoryCode + "&GenerateNOAOption=" + generateNOAOption + "&NewIncomeRecord=" + newIncomeRecord,
                cache: false,
                success: function (data) {
                    var detailDialog = new $APP.UI.Dialog({
                        id: 'noaTemplateSelection',
                        title: "NOA Template Selection",
                        titleColor: 'green',
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

function generateNOA(generateNOAOption, familyID, effectiveDate, noaCategoryCode, templateID, newIncomeRecord) {
    //alert('generateNOA');
    $.ajax({
        url: root + 'CaseManagement/Family/' + $('#FamilyID').val() + '/IncomeFee/GenerateNOA/',
        data: "familyID=" + familyID + "&EffectiveDate=" + effectiveDate + "&NOACategoryCode=" + noaCategoryCode + "&TemplateID=" + templateID+ "&NewIncomeRecord="+newIncomeRecord,
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