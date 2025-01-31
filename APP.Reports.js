$.ajaxSetup({ cache: false })
if ($APP) {

    //
    // BEGIN NAMESPACE: $APP.Reports
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    $APP.namespace('$APP.Reports');
    $APP.Reports = (function () {
        // Note: this function requires fully qualified references to itself as the function
        // is passed to another as an argument below, in "$APP.initializers.push($APP.Reports);"
        return {
            init: function () {
                $APP.log('$APP.Reports.init() started');
                $APP.Reports.registerNewContent(document);
                $APP.log('$APP.Reports.init() finished');
            }
        }
    }());
    $APP.initializers.push($APP.Reports.init);

    $APP.Reports.registerNewContent = function (scope) {
        // $APP.Reports.register(scope);
        $APP.log('$APP.Reports.registerNewContent() complete');
    };
    $APP.contentRegistrars.push($APP.Reports.registerNewContent);

    $APP.Reports.print = function (reportForm, reportAction) {
        var reportCriteriaForm = $APP.Forms.clone($(reportForm));
        reportCriteriaForm.css('display', 'none');

        var reportFrame = '<div id="report_frame"></div>';
        //var reportFrameTemplate = $('#report_frame_template').detach();
        var reportFrameTemplate = $('#report_frame_template');

        var reportPopup = new $APP.UI.Dialog({
            id: 'report_popup',
            title: 'Report Viewer',
            titleColor: 'blue',
            width: '100%',
            height: '600px',
            lightbox: true,
            iconURL: assets.images + 'icons/edit_16.png',
            content: reportFrame,
            shadow: true,
            resize: true
        });

        reportPopup.show();

        reportFrame = $('#report_frame');
        reportFrame.append($(reportFrameTemplate.html()));

        $APP.Reports.registerCloseButton(reportFrame);

        var userAgent = window.navigator.userAgent.toString();



        //        var URL = window.location.href;
        //        var showURL = URL.replace("Delete", "Show");
        //        window.history.pushState("", "", showURL + ".pdf");


        if (userAgent.indexOf('Safari') != -1) {

            // Code specific to safari

            var reportContent = $('<iframe />').load(function () {

                var iframeRef = reportFrame.find('iframe');

                iframeRef.unbind('load');
                iframeRef.contents().find('body').append(reportCriteriaForm);

                $APP.registerNewContent(reportFrame);

                $APP.UI.showLoading($("#report_frame"));
                //$APP.UI.showLoading(reportFrame.find('.loading_container'));

                if (typeof (reportAction) !== 'undefined') {
                    iframeRef.contents().find('form').attr('action', reportAction);
                }

                iframeRef.contents().find('form').submit();
                startPollingForCompletion();


                function startPollingForCompletion() {
                    setIntervalId = setInterval(closeProgressIndicator, 1000);
                }

                function closeProgressIndicator() {
                    var iframe = document.getElementById($(iframeRef).attr("id"));
                    var fileCookie = getCookie("fileDownloaded")

                    if (fileCookie == "true") {

                        $APP.UI.hideLoading($("#report_frame"));
                        reportFrame.find('.loading_container').remove();
                        document.cookie = 'fileDownloaded=false;path=/';
                        clearInterval(setIntervalId);
                    }
                }

                function getCookie(cname) {
                    var name = cname + "=";
                    var decodedCookie = decodeURIComponent(document.cookie);
                    var ca = decodedCookie.split(';');
                    for (var i = 0; i < ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1);
                        }
                        if (c.indexOf(name) == 0) {
                            return c.substring(name.length, c.length);
                        }
                    }
                    return "";
                }


                //iframeRef.load(function (event) {
                //    iframeRef.unbind('load');
                //    $APP.UI.hideLoading(reportFrame.find('.loading_container'));
                //    reportFrame.find('.loading_container').remove();

                //    if (iframeRef.contents().find('.validation_error_summary ').length > 0) {
                //        alert('There were problems with the criteria you submitted.');
                //        $APP.UI.Lightbox.hide();
                //        $('#report_popup').remove();
                //    } else {
                //        iframeRef.contents().find('embed').focus();
                //    }
                //});
            });
            reportFrame.find('.report_content').html(reportContent);

        } else {
            // All other browsers
            reportFrame.find('iframe').load(function (event) {
                var iframeRef = reportFrame.find('iframe');
                iframeRef.unbind('load');
                iframeRef.contents().find('body').append(reportCriteriaForm);


                $APP.registerNewContent(reportFrame);
                $APP.UI.showLoading($("#report_frame"));

                //  $APP.UI.showLoading(reportFrame.find('.loading_container'));


                if (typeof (reportAction) !== 'undefined') {

                    iframeRef.contents().find('form').attr('action', reportAction);
                }

                iframeRef.contents().find('form').submit();
                startPollingForCompletion();



                function startPollingForCompletion() {
                    setIntervalId = setInterval(closeProgressIndicator, 1000);
                }

                function closeProgressIndicator() {
                    var iframe = document.getElementById($(iframeRef).attr("id"));
                    var fileCookie = getCookie("fileDownloaded")

                    if (fileCookie == "true") {

                        $APP.UI.hideLoading($("#report_frame"));
                        reportFrame.find('.loading_container').remove();
                        document.cookie = 'fileDownloaded=false;path=/';
                        clearInterval(setIntervalId);
                    }
                }

                function getCookie(cname) {
                    var name = cname + "=";
                    var decodedCookie = decodeURIComponent(document.cookie);
                    var ca = decodedCookie.split(';');
                    for (var i = 0; i < ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1);
                        }
                        if (c.indexOf(name) == 0) {
                            return c.substring(name.length, c.length);
                        }
                    }
                    return "";
                }

                //iframeRef.load(function (event) {

                //    event.preventDefault();
                //    iframeRef.unbind('load');

                //    $APP.UI.hideLoading(reportFrame.find('.loading_container'));
                //    $APP.UI.hideLoading($("#report_frame"));

                //    reportFrame.find('.loading_container').hide();

                //    if (iframeRef.contents().find('.validation_error_summary ').length > 0) {
                //        alert('There were problems with the criteria you submitted.');
                //        $APP.UI.Lightbox.hide();
                //        $('#report_popup').remove();
                //    } else {
                //        iframeRef.contents().find('embed').focus();
                //    }
                //});
            });
        }
    };

    $APP.Reports.Export = function (reportForm, reportAction) {

        var reportCriteriaForm = $APP.Forms.clone($(reportForm));
        var formRef = $("#ReportAnchorForm")
        $(formRef).attr('action', reportAction);
        $(formRef).submit();

    };

    $APP.Reports.registerCloseButton = function (reportFrame) {
        reportFrame.find('#close_report_button').unbind('click');
        reportFrame.find('#close_report_button').bind('click', function (event) {
            event.preventDefault();

            reportFrame.find('iframe').attr('src', 'about:blank');
            reportFrame.find('.report_content').hide();
            $('#report_popup').remove();
        });
    }

    $APP.Reports.copyInputValues = function (sourceElement, destinationElement, newIDSuffix) {
        var htmlData = '';
        destinationElement.html('');

        sourceElement.find('input, select, textarea').each(function (i, obj) {
            if (obj.id.length > 0) {
                var newObjID = obj.id + newIDSuffix;
                var newObjVal = ($(obj).val() == 'undefined') ? null : $(obj).val();
                var newObjSelectVal = ($('#' + obj.id + ' option').filter(':selected').length == 0) ? null : $('#' + obj.id + ' option').filter(':selected').val();

                if ($(obj).is("select")) {
                    htmlData = '<input type="hidden" name="' + obj.name + '" id="' + newObjID + '" value="' + newObjSelectVal + '">';
                } else {
                    switch (obj.type) {
                        case "checkbox":
                            if (obj.checked) {
                                htmlData = '<input type="hidden" name="' + obj.name + '" id="' + newObjID + '" value="true">';
                            } else {
                                htmlData = '<input type="hidden" name="' + obj.name + '" id="' + newObjID + '" value="false">';
                            }
                            break;
                        default:
                            htmlData = '<input type="hidden" name="' + obj.name + '" id="' + newObjID + '" value="' + newObjVal + '">';
                    }
                }
                destinationElement.append($(htmlData));
            }
        });
    }
}