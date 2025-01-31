$.ajaxSetup({ cache: false })
if ($APP) {

    //
    // BEGIN NAMESPACE: "$APP.Forms"
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    $APP.namespace('$APP.Forms');
    $APP.Forms = (function () {
        var _forms = [];
        _forms.init = function () {
            $APP.log('$APP.Forms.init() started');
            $APP.Forms.registerNewContent(document);
            //$APP.Forms.registerDropDownItemNames(document);
            $APP.log('$APP.Forms.init() finished');
        }

        return _forms;
    } ());

    $APP.initializers.push($APP.Forms.init);

    //
    // It'd be nice to set up $FORMS as a simple shortcut variable to the $APP.Forms namespace but 
    // then we wouldn't want to expose $FORMS as a global variable to everyone. So, a sandboxed setup  
    // is used below where $APP.Forms is passed as a parameter to an immediate function.  This is  
    // used for all namespaces.

    (function ($FORMS) {

        $FORMS.clone = function (originalForm) {
            originalForm = $(originalForm);
            var newForm = $(originalForm).clone();
            originalForm.find('input, select, textarea').each(function (i, obj) {
                if (obj.id.length > 0) {
                    $(newForm).find('#' + obj.id).val($(obj).val());
                }
            });
            return newForm;
        };

        $FORMS.registerNewContent = function (scope) {

            $APP.log('$APP.Forms.registerNewContent(), finding forms...');
            $(scope).find('form').each(function (i, obj) {
                $APP.Forms.push(new $APP.Forms.Form(obj));
                $APP.Errors.registerServerErrors(scope);
            });
            $APP.log('$APP.Forms.registerNewContent(), complete');
        };
        $APP.contentRegistrars.push($FORMS.registerNewContent);

        $FORMS.registerDropDownItemNames = function (scope) {
            $APP.log('$APP.Forms.registerDropDownItemNames(), finding inputs...');

            $(scope).find('.drop_down_item_name').each(function (i, obj) {

                obj = $(obj);
                var targetDropDown = $('#' + obj.attr('value'));
                var dropDownValue = targetDropDown.val();

                obj.val(targetDropDown.find('option[value=' + dropDownValue + ']').text());

                targetDropDown.change(function (event) {
                    dropDownValue = targetDropDown.val();

                    //alert(targetDropDown.find('option[value=' + dropDownValue + ']').text());

                    //obj.val(targetDropDown.find('option[value=' + dropDownValue + ']').text());
                });

                /*
                var targetDropDown = $('#' + obj.attr('value'));
                var dropDownValue = targetDropDown.val();

                alert(dropDownValue);
                obj.val(dropDownValue);

                return true;

                obj.val(targetDropDown.find('option[value=' + dropDownValue + ']').text());
                targetDropDown.change(function (event) {
                obj.val(targetDropDown.find('option[value=' + dropDownValue + ']').text());
                alert(obj.val());
                });
                */
            });

            $APP.log('$APP.Forms.registerDropDownItemNames(), complete');
        };
        $APP.contentRegistrars.push($FORMS.registerDropDownItemNames);

        $FORMS.DropDownItems = {};


        //
        // Public Property: "activeInlineForm"
        // Used to indicate whether or not there is an active inline editable list on the form. 
        // Currently, this is only set from an object of the type $APP.UI.EditableList.

        $FORMS.activeInlineForm = false;

        $FORMS.copySelectedListItems = function (listFrom, listTo) {
            listFrom = $(listFrom);
            listTo = $(listTo);
            var items = listFrom.find('option:selected');
            var copiedItems = listFrom.find('option:selected').clone();
            listTo.append(copiedItems);
            $APP.Forms.sortList(listTo);
            items.remove();
        };

        $FORMS.find = function (formRef) {
            for (var i = 0; i < this.length; i++) {
                if (this[i].htmlRef === formRef) {
                    return this[i];
                }
            }
            return false;
        };

        //
        // Public Property: "findParent"
        // Takes an element as a parameter and returns a reference to a JavaScript Form object
        // from the $FORMS array

        $FORMS.findParent = function (element) {
            var parentForm = $APP.findParentByElementType(element, 'form');

            if (parentForm.length > 0) {
                parentForm = parentForm.get(0);
                for (var i = 0; i < this.length; i++) {
                    if (this[i].htmlRef === parentForm) {
                        return this[i];
                    }
                }
                return false;
            } else {
                return false;
            }
        };

        $FORMS.sortList = function (list) {
            var sortedItems = [];
            list = list.get(0);
            for (i = 0; i < list.options.length; i++) {
                sortedItems[i] = [list.options[i].value, list.options[i].text, list.options[i].selected];
            }
            sortedItems.sort(function (x, y) {
                return (x[1] < y[1]) ? -1 : ((x[1] > y[1]) ? 1 : 0);
            });
            for (i = 0; i < list.options.length; i++) {
                list.options[i].value = sortedItems[i][0];
                list.options[i].text = sortedItems[i][1];
                list.options[i].selected = sortedItems[i][2];
            }
        };

        //
        // Constructor function: "Form"
        // Represents a form element and contains some useful methods for dealing with form
        // operations, like displaying errors, etc...

        $FORMS.Form = (function () {

            var _Form = function (htmlRef) {

                this.validations = [];
                this.customProperties = [];

                this.htmlRef = htmlRef;
                this.validationDisabled = false;
                this.preservedForm = {};
                this.preservedFormName = '';

                this.errorSummaryID = '';
                this.errorSummaryUIRef = '';

                this.setHtmlReferences();
                this.registerUndoButton();
                this.registerSaveButton();
                this.registerHistoryButton();
                this.registerInLineInputClearButton();
                this.registerInLineDropdownClearButton();

                $APP.log('$APP.Forms.Form, "' + this.htmlRef.id + '" created');
            };

            _Form.prototype = {

                clear: function () {
                    $(this.htmlRef).find(':input').each(function () {
                        switch (this.type) {
                            case 'password':
                            case 'select-multiple':
                            case 'select-one':
                            case 'text':
                            case 'textarea':
                                $(this).val('');
                                break;
                            case 'checkbox':
                            case 'radio':
                                this.checked = false;
                        }
                    });
                    $APP.log('$APP.Forms.clear() complete');
                },

                editableListParent: function () {
                    var inEditableList = $APP.findParentByClassName(this.htmlRef, 'editable_list');
                    inEditableList = inEditableList || $APP.findParentByClassName(this.htmlRef, 'inline_editable_list');
                    return inEditableList;
                },

                registerUndoButton: function () {

                    var undoButton = $(this.htmlRef).find('.undo_button');
                    var printButtonImage_SaveOnly = $(this.htmlRef).find('.print_only_on_save');
                    var printButton_SaveOnly = $(this.htmlRef).find('#id_print_income_worksheet_button');

                    if (undoButton.length == 1) {

                        $APP.log('$APP.Forms.Form.registerUndoButton(), started');

                        // obtain a copy of the form the undo button is for and preserve its name
                        this.preservedForm = $(this.htmlRef).clone();
                        this.preservedFormName = this.preservedForm.attr("id");

                        // a string of element types that will be iterated over next
                        var elements = 'select, textarea, input[type=text], input[type=checkbox], input[type=radio], input[type=password]';

                        // look for all of the elements in the string and bind a "change" event handler to each one found.
                        // each time an item is changed, it will cause the undo button to show.
                        $(this.htmlRef).find(elements).each(function (idx) {
                            $(this).bind('change', function (event) {
                                $(this).addClass("changed");
                                sessionStorage.setItem('isDirty', true);
                                undoButton.show();
                                printButtonImage_SaveOnly.css({ "opacity": "0.3" });
                                printButton_SaveOnly.attr('disabled', 'disabled');
                            });
                        });

                        // finally, bind a handler for the undo button itself.  when clicked,
                        // this will replace the current form with the preserved one and will
                        // register all original functionality.
                        undoButton.bind('click', function (event) {
                            event.preventDefault();
                            
                            sessionStorage.setItem('isDirty', false);
                            var parentForm = $APP.Forms.findParent(this);
                            parentForm.updateInterface();
                        });
                        $APP.log('$APP.Forms.Form.registerUndoButton(), complete');
                    }
                },

                registerInLineInputClearButton: function () {
                   
                    $(this.htmlRef).find('.input_clear_range_cntrl .clear_btn , .input_clear_cntrl .clear_btn').each(function (i, obj) {
                        $(this).bind("click", function (event) {
                            event.preventDefault();

                            $(this).parent().parent().find(':input[type=text]').each(function (i, obj) {
                                $(this).val("");
                            });
                        });
                    });

                },


                registerInLineDropdownClearButton: function () {

                    $(this.htmlRef).find('.input_clear_dropdown_cntrl .clear_btn, .input_clear_dropdown_range_cntrl .clear_btn').each(function (i, obj) {

                        $(this).bind("click", function (event) {
                            event.preventDefault();
                            $(this).parent().parent().find(':input').each(function (i, obj) {
                                //var option = $(this).find('option[selected]')
                                //$(this).val($(option).val())
                                $(this).val("");
                            });
                        });
                    });

                },

                registerHistoryButton: function () {

                    var historyBtn = $(this.htmlRef).find('.history_button');
                    var historyBtnURL = $(historyBtn).data('url');

                    if (historyBtn.length == 1) {

                        historyBtn.bind('click', function (event) {
                            event.preventDefault();

                            $.ajax({
                                url: historyBtnURL,
                                type: 'GET',
                                cache: false,
                                success: function (data) {
                                    var historyDialog = new $APP.UI.Dialog({
                                        id: "id_updateActivity",
                                        title: "Update Activity",
                                        titleColor: 'blue',
                                        width: '33%',
                                        lightbox: true,
                                        iconURL: assets.images + 'icons/opnbr_16.png',
                                        content: data,
                                        shadow: true
                                    });

                                    historyDialog.show();
                                }
                            });
                        });
                    }
                },

                registerSaveButton: function () {

                    var saveButton = $(this.htmlRef).find('.save_button');

                        $APP.log('$APP.Forms.Form.registerSaveButton(), started');

                        saveButton.bind('click', function (event) {
                           // event.preventDefault();
                           
                            sessionStorage.setItem('isDirty', false);
//                            alert("save pressed" +"\n"+ "dirtyFlag"+sessionStorage.getItem('isDirty')); 
                        });
                        $APP.log('$APP.Forms.Form.registerSaveButton(), complete');
                },

                scanForErrors: function () {
                    for (var i = 0; i < this.validations.length; i++) {
                        this.validations[i].func();
                    }
                    for (var i = 0; i < this.customProperties.length; i++) {
                        if (this.customProperties[i].type == "SetRequiredProperty") {
                            $APP.Forms.Validation.ValidateNotEmptyField($('#' + this.customProperties[i].field).get(0), this.customProperties[i].message);
                        }
                    }

                    // Return true if any errors were found.
                    if (this.errorSummaryUIRef) {
                        return this.errorSummaryUIRef.errors.length > 0;
                    }
                },

            

                setHtmlReferences: function () {

                    this.htmlRef = $(this.htmlRef).get(0);
                    this.id = this.htmlRef.id;

                    var editableListUIRef = this.editableListParent();

                    if ($(this.htmlRef).data('ErrorSummary') != undefined) {
                        this.errorSummaryID = $(this.htmlRef).data('ErrorSummary');
                        this.errorSummaryUIRef = $APP.Errors.Summaries.find(this.errorSummaryID);

                    } else {
                        if (editableListUIRef) {
                            editableListUIRef = $APP.UI.EditableLists.find($(editableListUIRef).get(0).id);
                            this.errorSummaryID = editableListUIRef.errorSummaryID;
                            this.errorSummaryUIRef = editableListUIRef.errorSummaryUIRef;
                        }
                    }

                    $APP.Errors.ApplyReportingInterface(this);

                    // if we're dealing with a normal form not contained in an inline list, bind our submission
                    // functions to it and handle the submit.
                    if (!editableListUIRef) {

                        $(this.htmlRef).bind('submit', function (event) {
                            event.preventDefault();

                            // First check for errors if we have a summary reference to display errors at
                            if (this.summaryHtmlRef != 'undefined') {
                                var formUIObject = $APP.Forms.find(this);
                                formUIObject.scanForErrors();
                            }

                            if (!formUIObject.hasClientSideErrors()) {
                                var preSubmitFunctionResult = true;
                                if ($(this).data('preSubmitFunction') != undefined) {
                                    preSubmitFunctionResult = eval($(this).data('preSubmitFunction') + '()');
                                }

                                if (preSubmitFunctionResult != false) {
                                    var submitViaAjax = $(this).data('submitViaAjax') || false;
                                    if (submitViaAjax.toString().toLowerCase() == 'true') {
                                        $.post(formUIObject.htmlRef.action, $(formUIObject.htmlRef).serialize(), function (data) {
                                            var newForm = $(data);
                                            $(formUIObject.htmlRef).replaceWith(newForm);
                                            formUIObject.htmlRef = newForm;
                                            formUIObject.setHtmlReferences();
                                            formUIObject.registerUndoButton();
                                            formUIObject.registerSaveButton();
                                            $APP.registerNewContent(newForm);
                                            if ($(formUIObject.htmlRef).data('postSubmitFunction')) {
                                                eval($(formUIObject.htmlRef).data('postSubmitFunction') + '()');
                                            }
                                        });

                                    } else {
                                        this.submit();
                                    }
                                }
                            } else {
                                $(formUIObject.htmlRef).find(':input').removeAttr('disabled');
                                //alert('You must correct all errors before submitting the form');  //temp as it causes to not to proceed to validations functions
                            }
                        });
                    }

                    $APP.log('$APP.Forms.Form.setHtmlReferences(), complete');
                    return true;
                },

                updateInterface: function () {
                    //hbo

                    $(this.htmlRef).replaceWith(this.preservedForm);
                    this.htmlRef = $('#' + this.preservedFormName);
                    this.setHtmlReferences();
                    $APP.registerNewContent($(this.htmlRef));
                    this.registerUndoButton();
                    this.registerSaveButton();
                }
            }

            return _Form;
        } ());

    } ($APP.Forms));
}


