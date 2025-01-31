$.ajaxSetup({ cache: false })
if ($APP) {

    //
    // BEGIN NAMESPACE: "$APP.Errors"
    //

    $APP.namespace('$APP.Errors');
    $APP.Errors = (function () {
        return {
            init: function () {
                $APP.log('$APP.Errors.init() started');
                $APP.Errors.registerNewContent(document);
                $APP.log('$APP.Errors.init() finished');
            }
        }

    } ());
    $APP.initializers.push($APP.Errors.init);

    $APP.Errors.registerNewContent = function (scope) {
        $APP.Errors.Summaries.register(scope);
        $APP.log('$APP.Errors.registerNewContent() complete');
    };
    $APP.contentRegistrars.push($APP.Errors.registerNewContent);

    $APP.Errors.errorTypes = {
        client: 'client',
        server: 'server',
        security: 'security',
        customProperties: 'customproperties'
    };

    $APP.Errors.errorColors = {
        changed: '#ffffcc',
        invalid: '#ffdead',
        highlight: '#D6EFFF',
        normal: '#FFFFFF'
    };

    $APP.Errors.registerServerErrors = function (scope) {
        // Resolve the scope before we begin
        scope = scope || $(document);

        $(scope).find('.element_data').each(function (i, obj) {
            var dataElements = obj.value.split('[:::]');
            var parentObject = $APP.Forms.findParent($('#' + dataElements[0]).get(0));

            if (parentObject) {

                dataElements[1] = dataElements[1].toLowerCase();

                if (dataElements[1].toLowerCase() == $APP.Errors.errorTypes.server || dataElements[1].toLowerCase() == $APP.Errors.errorTypes.client || dataElements[1].toLowerCase() == $APP.Errors.errorTypes.security || dataElements[1].toLowerCase() == $APP.Errors.errorTypes.customProperties) {

                    var embeddedOrdinalFlags = dataElements[2].match(/\{\d{1}\}/);
                    
                    if (embeddedOrdinalFlags != null) {

                        var ordinalToken = '';
                        var ordinalValue = -1;
                        var embeddedData = [];

                        for (var i = 0; i < embeddedOrdinalFlags.length; i++) {
                            ordinalToken = embeddedOrdinalFlags[i].toString();
                            ordinalValue = ordinalToken.replace("{", '').replace("}", '');
                            embeddedData = $('#' + dataElements[0]).data(ordinalValue).split('::');

                            if (embeddedData[0] == 'link') {
                                var linkString = '<a href="' + embeddedData[1] + '" target="new">' + embeddedData[2] + '</a>';
                                dataElements[2] = dataElements[2].replace(ordinalToken, linkString);
                            }
                        }
                    }
                    
                    $APP.log('$APP.Errors.registerServerErrors(), found "' + dataElements[2] + '" for field "' + dataElements[0] + '"');
                    parentObject.addError($('#' + dataElements[0]).get(0), dataElements[2], dataElements[1]);
                }

            } else {

                
                // If we're dealing with an inline list, then the summary won't be contained in
                // list. So, we'll search for summaries of the same name and then proceed from there.

                var parentObject = $APP.Errors.Summaries.find(dataElements[0]);

                if (parentObject != false) {

                    //if (parentObject.get(0).tagName == 'FORM') {
                    //    var targetFormUIRef = $FORMS.find(targetForm.get(0));
                    //    targetFormUIRef.addError(parentObject.get(0), dataElements[2], dataElements[1]);

                    //} else 

                    parentObject.addError($('#' + dataElements[0]).get(0), dataElements[2], dataElements[1]);

                    //var messageIcon = ' <img src="' + assets.images + 'blank.png" class="icon_image icon_Small_StopSign icon_Small" />';
                    //var messageSpan = ' <span>' + dataElements[2] + '</span>';
                    //var newMessage = '<li class="error_message" id="error_message_' + 1 + '">' + messageIcon + messageSpan + '</li>';

                    //var targetList = $APP.UI.EditableLists.find(targetForm.get(0).id);

                    //newMessage = $(newMessage);
                    //targetList.errorSummaryRef.find('ul').append(newMessage);

                    //targetList.errorSummaryRef.show();

                    //targetList.showErrorSummary('blah blah blah');

                    // Add a reference to the message
                    //newMessage = $(newMessage);
                    //errorObj.messageHtmlRef = newMessage;

                    //alert(newMessage);

                    // Now that the error has been added, show the error summary
                    //if ($(this.summarySurfaceHtmlRef).find('p').html().length == 0) {
                    //    $(this.summarySurfaceHtmlRef).find('p').html('There were problems with the form you submitted. Please correct your errors below:');
                    //}


                }

                return false;
            }
        });
        $APP.log('$APP.Forms.registerServerErrors() complete');
    }


    //
    // $APP.Errors.ReportingInterface
    // ************************************************

    $APP.Errors.ReportingInterface = function () {

        this.addError = function (element, message, scope) {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.addError(element, message, scope);
        }

        this.correctError = function (element, message) {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.correctError(element, message);
        }

        this.hasClientSideErrors = function () {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.hasClientSideErrors();
        }

        this.hideErrorSummary = function () {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.hideErrorSummary();
        }

        this.removeError = function (errorRef) {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.removeError(errorRef);
        }

        this.removeAllErrors = function () {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.removeAllErrors();
        }

        this.showErrorSummary = function () {
            if (this.errorSummaryUIRef) return this.errorSummaryUIRef.showErrorSummary();
        }
    }

    //
    // $APP.Errors.ApplyReportingInterface
    // ************************************************

    $APP.Errors.ApplyReportingInterface = function (obj) {
        this.ReportingInterface.apply(obj);
    };



    //
    // $APP.Errors.Summaries
    // ************************************************

    $APP.Errors.Summaries = [];

    $APP.Errors.Summaries.register = function (scope) {
        $APP.log('$APP.Errors.Summaries.register() started');
        var errorSummaries = $(scope).find('.validation_error_summary');
        errorSummaries.each(function (i, element) {
            $APP.Errors.Summaries.push(new $APP.Errors.ErrorSummary(element));
        });
        $APP.log('$APP.Errors.Summaries.register() finished, ' + this.length + ' found.');
    };

    $APP.Errors.Summaries.find = function (id) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].id == id) {
                return this[i];
            }
        }
        return false;
    };

    $APP.Errors.Summaries.findParent = function (element) {
        var parentSummary = $APP.findParentByClassName(element, 'validation_error_summary');

        // If a text box or other element, rather than an error message, is getting passed in, try to find an associated error message and use that to get to the summary
        if (parentSummary.length > 0) {
        } else {
            var errorIndex = -1;
            for (var j = 0; j < this.length; j++) {
                for (var i = 0; i < this[j].errors.length; i++) {
                    if (this[j].errors[i].htmlRef === element) {
                        //if ($APP.Errors.Summaries[j].errors[i].message == message) {
                            errorIndex = i;
                            break;
                        //}
                    }
                }
            }

            if (errorIndex != -1) {
                var errorElement = $('#error_message_' + errorIndex);
                parentSummary = $APP.findParentByClassName(errorElement.get(0), 'validation_error_summary');
            }
        }

        if (parentSummary.length > 0) {
            parentSummary = parentSummary.get(0);
            for (var i = 0; i < this.length; i++) {
                if (this[i].htmlRef === parentSummary) {
                    return this[i];
                }
            }
            return false;
        } else {
            return false;
        }
    }


    //
    // $APP.Errors.ErrorSummary
    // ************************************************

    $APP.Errors.ErrorSummary = (function () {

        var _errorSummary = function (htmlRef) {
            this.id = htmlRef.id;
            this.htmlRef = htmlRef;
            this.summarySurfaceHtmlRef = $(this.htmlRef).find('.html_dialog_content');
            this.errors = [];
        };

        _errorSummary.prototype = {

            addError: function (element, message, scope, comparisonElement) {

                var errorIndex = -1;
                var errorObj = {};

                // First, search the errors array to see if this error has already been added
                // and set some flags based on this.
                for (var i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].htmlRef === element) {
                        if (this.errors[i].message == message) {
                            errorIndex = i;
                            break;
                        }
                    }
                }

                // If the error has not been found, add it. Otherwise, set the error 
                // object based on the errorIndex that was found in the search above
                if (errorIndex == -1) {

                    $APP.log('$APP.Errors.addError(), adding error for ' + element.id + ', "' + message + '"');

                    // add a new error and capture the index. then set a reference to it.
                    errorIndex = this.errors.push({
                        htmlRef: element,
                        comparisonHtmlRef: comparisonElement,
                        message: message,
                        scope: scope,
                        isValid: false
                    }) - 1;

                    errorObj = this.errors[errorIndex];

                    var messageIcon = ' <img src="' + assets.images + 'blank.png" class="icon_image icon_Small_StopSign icon_Small" />';
                    var messageSpan = ' <span>' + this.errors[errorIndex].message + '</span>';
                    var newMessage = '<li class="error_message" id="error_message_' + errorIndex + '">' + messageIcon + messageSpan + '</li>';

                    // Add a reference to the message
                    newMessage = $(newMessage);
                    errorObj.messageHtmlRef = newMessage;

                } else {
                    errorObj = this.errors[errorIndex];
                    errorObj.isValid = false;
                }

                // Set the error message color background and change the icon if this was a previously corrected error
                $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                $(errorObj.messageHtmlRef).find('.icon_image').removeClass('icon_Small_Checkmark');
                $(errorObj.messageHtmlRef).find('.icon_image').addClass('icon_Small_StopSign');

                // Show the icon next to the field and change the icon if this was a previously corrected error
                $('.' + errorObj.htmlRef.id + '_error').removeClass('icon_Small_Checkmark');
                $('.' + errorObj.htmlRef.id + '_error').addClass('icon_Small_StopSign');
                $('.' + errorObj.htmlRef.id + '_error').show();

                // Remove the "changed" class if it's been applied before and set the color to the "invalid" one
                if ($(errorObj.htmlRef).get(0).tagName != 'FORM') {
                    $(errorObj.htmlRef).removeClass("changed");
                    $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                }

                if (errorObj.comparisonHtmlRef !== undefined) {
                    if ($(errorObj.comparisonHtmlRef).get(0).tagName != 'FORM') {
                        $(errorObj.comparisonHtmlRef).removeClass("changed");
                        $(errorObj.comparisonHtmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                    }
                }

                // When the user floats their mouse over a message, it should highlight both the field
                // and the message. When they mouse out, it should revert the field back to the color it
                // was previously.

                if ($(errorObj.htmlRef).get(0).tagName != 'FORM') {
                    $(errorObj.messageHtmlRef).hover(function (event) {

                        var index = this.id.replace('error_message_', '');
                        var summaryRef = $APP.Errors.Summaries.findParent(this);

                        return false;

                        var errorObj = summaryRef.errors[index];

                        $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                        $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                        if (errorObj.comparisonHtmlRef !== undefined) {
                            $(errorObj.comparisonHtmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                        }
                    }, function (event) {

                        var index = this.id.replace('error_message_', '');
                        var summaryRef = $APP.Errors.Summaries.findParent(this);
                        var errorObj = summaryRef.errors[index];

                        if (errorObj.scope == $APP.Errors.errorTypes.client || errorObj.scope == $APP.Errors.errorTypes.customProperties) {
                            if (!errorObj.isValid) {
                                $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                                $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                                if (errorObj.comparisonHtmlRef !== undefined) {
                                    $(errorObj.comparisonHtmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                                }
                            } else {
                                $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.normal);
                                $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.changed);
                                if (errorObj.comparisonHtmlRef !== undefined) {
                                    $(errorObj.comparisonHtmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                                }
                            }
                        } else {
                            $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.changed);
                            $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.changed);
                            if (errorObj.comparisonHtmlRef !== undefined) {
                                $(errorObj.comparisonHtmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                            }
                        }
                    });

                    // If the user clicks the message, it should set focus to the field
                    $(this.errors[errorIndex].messageHtmlRef).click(function (event) {
                        var index = this.id.replace('error_message_', '');
                        var summaryRef = $APP.Errors.Summaries.findParent(this);
                        var errorObj = summaryRef.errors[index];
                        $(errorObj.htmlRef).focus();
                    });
                }

                // If the field receives focus, it should highlight all of the messages associated with it
                $(this.errors[errorIndex].htmlRef).bind('focus', function () {
                    var formRef = $APP.Forms.findParent(this);
                    formRef.errorSummaryUIRef.highlightErrorMessages(this);
                });

                // If the field receives focus, it should remove the highlight from all of the messages associated with it
                $(this.errors[errorIndex].htmlRef).bind('blur', function () {
                    var formRef = $APP.Forms.findParent(this);
                    formRef.errorSummaryUIRef.unHighlightErrorMessages(this);
                });

                // We'll need to bind our server side error to the onChange and have show an
                // indication that they've been changed after the user is done editing.
                if (errorObj.scope == $APP.Errors.errorTypes.server) {
                    $(errorObj.htmlRef).bind('change', function (event) {

                        var summaryRef = $APP.Errors.Summaries.findParent(this);

                        if (!summaryRef) {
                            var listUIRef = $APP.UI.EditableLists.findParent(this);

                            if (listUIRef) {
                                summaryRef = $APP.Errors.Summaries.find(listUIRef.errorSummaryID);
                            }
                        }

                        if (summaryRef) {
                            var errors = summaryRef.findError(element);
                            if (errors.length > 0) {
                                $.each(errors, function (i, errorObj) {
                                    if (errorObj.scope == $APP.Errors.errorTypes.server) {
                                        summaryRef.correctError(errorObj.htmlRef, errorObj.message);
                                        //var currentMessage = $(errorObj.messageHtmlRef).find('span').html();
                                        //$(errorObj.messageHtmlRef).find('span').html(currentMessage + ' - <em>(will be validated upon saving)</em>');
                                    }
                                });
                            }
                        } else {
                            alert('Summary not found!');
                            return false;
                        }
                    });

                    if (errorObj.comparisonHtmlRef !== undefined) {
                        $(errorObj.comparisonHtmlRef).bind('change', function (event) {

                            var summaryRef = $APP.Errors.Summaries.findParent(this);

                            if (!summaryRef) {
                                var listUIRef = $APP.UI.EditableLists.findParent(this);

                                if (listUIRef) {
                                    summaryRef = $APP.Errors.Summaries.find(listUIRef.errorSummaryID);
                                }
                            }

                            if (summaryRef) {
                                var errors = summaryRef.findError(element);
                                if (errors.length > 0) {
                                    $.each(errors, function (i, errorObj) {
                                        if (errorObj.scope == $APP.Errors.errorTypes.server) {
                                            summaryRef.correctError(errorObj.htmlRef, errorObj.message);
                                            //var currentMessage = $(errorObj.messageHtmlRef).find('span').html();
                                            //$(errorObj.messageHtmlRef).find('span').html(currentMessage + ' - <em>(will be validated upon saving)</em>');
                                        }
                                    });
                                }
                            } else {
                                alert('Summary not found!');
                                return false;
                            }
                        });
                    }
                }

                // Now that the error has been added, show the error summary
                if ($(this.summarySurfaceHtmlRef).find('p').html().length == 0) {
                    $(this.summarySurfaceHtmlRef).find('p').html('There were problems with the form you submitted. Please correct your errors below:');
                }

                //for precision search by ID first

                var errorSummaryUIRefID = $(this).attr("id");

                if (errorSummaryUIRefID != "" || errorSummaryUIRefID != null) {
                    $("#" + errorSummaryUIRefID).find(".html_dialog_surface").find('p').html('There were problems with the form you submitted. Please correct your errors below:');
                    $("#" + errorSummaryUIRefID).find(".html_dialog_surface").find('ul').append(newMessage);
                    $("#" + errorSummaryUIRefID).show();
                }
                else {
                    $(this.summarySurfaceHtmlRef).find('ul').append(newMessage);
                    $(this.htmlRef).show();
                }

            },

            correctError: function (element, message) {

                var errorIndex = -1;
                var errorObj = {};

                for (var i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].htmlRef === element) {
                        if (this.errors[i].message == message) {
                            errorIndex = i;
                            break;
                        }
                    }
                }

                // If the error has been found and it's invalid, correct it.
                if (errorIndex != -1) {

                    // If the error has been found and it's invalid, correct it.
                    if (errorIndex != -1) {

                        errorObj = this.errors[errorIndex];

                        $APP.log('$APP.Errors.addError(), correcting error for ' + element.id + ', "' + message + '"');

                        var currentMessage = $(errorObj.messageHtmlRef).find('span').html();
                        var inlineIcon = $('.' + element.id + '_error')
                        var sharedElements = [];
                        var sharedElementsWithErrors = false;

                        errorObj.isValid = true;
                        $(errorObj.htmlRef).addClass('changed');

                        $(errorObj.htmlRef).find('.icon_image').removeClass('icon_Small_StopSign');

                        if (this.errors[i].scope == $APP.Errors.errorTypes.client) {
                            errorObj.messageHtmlRef.find('.icon_image').addClass('icon_Small_Checkmark');

                        } else if (errorObj.scope == $APP.Errors.errorTypes.server) {
                            errorObj.messageHtmlRef.find('.icon_image').addClass('icon_Small_CheckmarkDisabled');
                        }

                        sharedElements = inlineIcon.attr('class').split(' ');

                        for (var elementName in sharedElements) {
                            elementName = sharedElements[elementName].replace('_error', '');
                            for (var j = 0; j < this.errors.length; j++) {
                                if (elementName == this.errors[j].htmlRef.id && this.errors[j].isValid == false) {
                                    sharedElementsWithErrors = true;
                                    break;
                                }
                            }
                        }

                        if (sharedElementsWithErrors == false) {
                            inlineIcon.removeClass('icon_Small_StopSign');

                            if (this.errors[i].scope == $APP.Errors.errorTypes.client) {
                                inlineIcon.addClass('icon_Small_Checkmark');

                            } else if (errorObj.scope == $APP.Errors.errorTypes.server) {
                                inlineIcon.addClass('icon_Small_CheckmarkDisabled');
                            }
                        }
                    }
                }

                return true;
            },

            findError: function (element, message) {
                var errors = [];
                for (var i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].htmlRef === element) {
                        if (message != undefined) {
                            if (this.errors[i].message == message) {
                                errors.push(this.errors[i]);
                                break;
                            }
                        } else {
                            errors.push(this.errors[i]);
                        }
                    }
                }
                if (errors.length > 0) {
                    return errors;
                } else {
                    return false;
                }
            },

            hasClientSideErrors: function () {
                for (var i = 0; i < this.errors.length; i++) {
                    if (this.errors[i].scope == 'client' && this.errors[i].isValid == false) return true;
                }
                return false;
            },

            hideErrorSummary: function () {
                if (this.htmlRef != false) $(this.htmlRef).hide();
            },

            highlightErrorMessages: function (element) {
                var errors = this.findError(element);
                if (errors.length > 0) {
                    $.each(errors, function (i, errorObj) {
                        $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                        $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.highlight);
                    });
                }
            },

            removeError: function (errorIndex) {
                $('#error_message_' + errorIndex).remove();
                this.errors.splice(errorIndex, 1);
            },

            removeAllErrors: function () {
                for (var i = this.errors.length - 1; i >= 0; i--) {
                    this.removeAllErrorHighlights(this.errors[i].htmlRef);
                    this.removeError(i);
                }
                this.hideErrorSummary();
            },


            setHtmlReferences: function () {
                this.htmlRef = $(this.htmlRef).find('.validation_error_summary');
            },

            showErrorSummary: function () {
                if (this.htmlRef != false) $(this.htmlRef).show();
            },

            unHighlightErrorMessages: function (element) {
                var errors = this.findError(element);
                if (errors.length > 0) {
                    $.each(errors, function (i, errorObj) {
                        if (errorObj.isValid) {
                            $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.changed);
                            $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.normal);
                        } else {
                            $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                            $(errorObj.messageHtmlRef).css('background-color', $APP.Errors.errorColors.invalid);
                        }
                    });
                }
            },

            removeAllErrorHighlights: function (element) {
                var errors = this.findError(element);
                if (errors.length > 0) {
                    $.each(errors, function (i, errorObj) {
                        $(errorObj.htmlRef).css('background-color', $APP.Errors.errorColors.changed);
                    });
                }
            }
        };

        return _errorSummary;
    } ());
}




