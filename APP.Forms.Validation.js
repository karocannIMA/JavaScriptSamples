$.ajaxSetup({ cache: false })
if ($APP) {
    
    // Author: Steven R.
    // BEGIN NAMESPACE: $APP.Forms.Validation
    ///////////////////////////////////////////////////////////////////////////////////////////////////
	

    $APP.namespace('$APP.Forms.Validation');
    $APP.Forms.Validation = (function () {
        return {
            init: function () {
                $APP.log('$APP.Forms.Validation.init() started');
                $APP.Forms.Validation.registerNewContent();
                $APP.log('$APP.Forms.Validation.init() finished');
            }
        }
    } ());
    $APP.initializers.push($APP.Forms.Validation.init);

    (function ($VAL) {

        var $FORMS = $APP.Forms;

        $VAL.registerNewContent = function (scope) {
            $APP.log('$APP.Forms.Validation.registerNewContent(), finding forms...');
            $APP.Forms.Validation.bindValidations(scope);
            $APP.log('$APP.Forms.Validation.registerNewContent(), complete');
        };
        $APP.contentRegistrars.push($VAL.registerNewContent);

        // 
        // Public function: "bindValidations"
        // Binds validation functions to elements that have validations defined.

        $VAL.bindValidations = function (scope) {
            $APP.log('$APP.Forms.Validation.bindValidations() started');
            var n = 0;
            scope = scope || document;
            $(scope).find('.element_data').each(function (i, obj) {

                var dataElements = obj.value.split('[:::]');
                var parentForm = $FORMS.findParent($('#' + dataElements[0]));

                //if (!parentForm)
                //    parentForm = $FORMS.findParent($('#' + dataElements[0]));

                if (parentForm && dataElements.length == 3) {
                    if (dataElements[1].indexOf('Validate') != -1) {
                        
                        $APP.log('$APP.Forms.Validation.bindValidations(), binding ' + dataElements[1] + 'Field to ' + dataElements[0]);

                        var field = '', comparisonField = '', validationType = dataElements[1], validationMessage = dataElements[2];
                        var fields = dataElements[0].split(',');    
                        
                        if (fields.length > 1) {
                            field = fields[0];
                            comparisonField = $.trim(fields[1]);
                        } else {
                            field = dataElements[0];
                        }

                        if (validationType == "ValidateNotEmpty")
                            $($('#' + field).get(0)).css('background-color', "#ffffcc");
                        //alert(validationType + ': ' + validationMessage);

                        var validationIndex = parentForm.validations.push({
                            field: field,
                            comparisonField: comparisonField,
                            type: validationType,
                            message: validationMessage,
                            func: function (event) {
                                var fieldRef = $('#' + field).get(0);

                                // $APP.Forms.Validation[validationType + 'Field'](fieldRef, validationMessage);
                                var messageRef = $('#' + field).data(validationType);
                                if (comparisonField.length > 0) {
                                    var comparisonFieldRef = $('#' + comparisonField).get(0);
                                    $APP.Forms.Validation[validationType + 'Field'](fieldRef, comparisonFieldRef, validationMessage);
                                } else {
                                    $APP.Forms.Validation[validationType + 'Field'](fieldRef, validationMessage);
                                }
                            }
                        });

                        var validation = parentForm.validations[validationIndex - 1];

                        if (comparisonField.length > 0) {
                            $('#' + validation.comparisonField).bind('blur', validation.func);
                        } else {
                            $('#' + validation.field).bind('blur', validation.func);
                        }

                        // If we're dealing with a date, add the date picker popup
                        if (validation.type == 'ValidateDate') {
                            $('#' + validation.field).datepicker();
                            $('#' + validation.field).datepicker().unbind('focus').dblclick(function () {
                                $(this).datepicker('show');
                            });
                        }
                        n++;
                    }
                }
            });
            $APP.log('$APP.Forms.Validation.bindValidations() finished, ' + n + ' validations binded.');
        };

        $VAL.reapplyValidations = function (targetForm) {
            // if a targetForm was passed in, check to see that the element belongs
            // to the targetForm.
            if (targetForm) {
                var validations = targetForm.validations;
                for (var i = 0; i < validations.length; i++) {
                    $('#' + validations[i].field).bind('blur', validations[i].func);

                    // If we're dealing with a date, add the date picker popup
                    if (validations[i].type == 'ValidateDate') {
                        $('#' + validations[i].field).datepicker();
                    }
                }
            }
            $APP.log('$APP.Forms.Validation.reapplyValidations() complete');
        };

        $VAL.isEmpty = function (element) {

            var val = $(element).val();
            var type = $(element).attr('type');
            var isSelect = type.toString().indexOf('select') >= 0;

            if (isSelect) {
                if (val == "" || val == null || val == -1) {
                    return true;
                } else {
                    return false;
                }
            } else{

                if (val == "" || val == null) {
                    return true;
                } else {
                    return false;
                }
           }
        };

        $VAL.isInteger = function (val) {
            var re = /^-?\d+$/;
            return re.test(val);
        };

        $VAL.isNumeric = function (val) {
            var re = /^-?\d+(\.\d*)?$/;
            return re.test(val);
        };

        $VAL.isNumericDecimal = function (val) {
            var re = /^-{0,1}\d*\.{0,1}\d+$/;
            return re.test(val);
        };

        $VAL.isValidCurrency = function (strVal) {
            //var re = /\$\d*\.\d{2}/
            var re = /\d*\.\d{2}/
            return re.test(strVal);
        };

        $VAL.isValidDate = function (val) {
            var re = /^(1[0-2]|0?[1-9])[\-\/](0?[1-9]|[12][0-9]|3[01])[\-\/]((19|20)?\d{2})$/
            var isValid = false;
             
            if(re.test(val) == true){

                try{
                        var dateToken = val.split("/");
                        Date.validateDay(parseInt(dateToken[1]), parseInt(dateToken[2]), parseInt(dateToken[0])-1);
                        isValid=true;
                    } catch(RangeErrorEx){}
                   
            }
           return isValid;
//            var re = /^(1[0-2]|0?[1-9])[\-\/](0?[1-9]|[12][0-9]|3[01])[\-\/]((19|20)?\d{2})$/
//            return re.test(val);
        
        };

        $VAL.isValidDuration = function (strVal) {
            var re = /^\d{0,3}\.\d{2}/
            return re.test(strVal);
        };

        $VAL.isValidEmail = function (strVal) {
            return true;
        };

        $VAL.isValidHour = function (strVal) {
            var re = /^\d{1,2}\:\d{2} ((am|AM)|(pm|PM))$/
            return re.test(strVal);
        };

        $VAL.isValidPhone = function (strVal) {
            
            var re = /^\(\d{3}\)\s{1}\d{3}\-\d{4}$/
            return re.test(strVal)
        };

        $VAL.isValidSSN = function (strVal) {
            var re = /^\d{3}\-\d{2}\-\d{4}$/
            return re.test(strVal)
        };

        $VAL.isValidZipCode = function(strVal){
            var re =  /^\d{5}(-\d{4})?(?!-)$/
            return re.test(strVal)
        }

        $VAL.isValid9DigitZipCode = function (strVal) {
            var re = /(^\d{5}-\d{4}$)/
            return re.test(strVal)
        }

        $VAL.ValidateIntegerField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid integer');
            if (targetForm) {
                if (element.value.length > 0) {
                    if ($VAL.isInteger(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateCurrencyField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid, monetary amount');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = formatCurrency(element.value);
                    if ($VAL.isValidCurrency(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateDateField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid date');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = $FORMS.Formats.formatDate(element.value);
                    if ($VAL.isValidDate(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateFutureDateField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid date');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = $FORMS.Formats.formatDate(element.value);
                        if ($VAL.isValidDate(element.value) == true ) {
                            var elementVal = new Date(element.value);
                            var comparisonElementVal = new Date();
                            //alert('Start date: ' + elementVal + ', stop date: ' + comparisonElementVal);
                            if (elementVal > comparisonElementVal) {
                                //alert('Date range validation failed');
                                targetForm.addError(element, displayMessage, 'client');
                                //targetForm.addError(comparisonElement, displayMessage, "client");
                            } else {
                                targetForm.correctError(element, displayMessage);
                            }
                        }
                    } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateDateRangeField = function (element, comparisonElement, message) {
//            
//            alert(element);
//            alert(comparisonElement);
//            alert(message);

            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'The start date must occur before the stop date');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = $FORMS.Formats.formatDate(element.value);
                    if (comparisonElement.value.length > 0) {
                        comparisonElement.value = $FORMS.Formats.formatDate(comparisonElement.value);
                        if ($VAL.isValidDate(element.value) == true && $VAL.isValidDate(comparisonElement.value) == true) {
                            var elementVal = new Date(element.value);
                            var comparisonElementVal = new Date(comparisonElement.value);
                            //alert('Start date: ' + elementVal + ', stop date: ' + comparisonElementVal);
                            if (elementVal > comparisonElementVal) {
                                //alert('Date range validation failed');
                                targetForm.addError(element, displayMessage, 'client', comparisonElement);
                                //targetForm.addError(comparisonElement, displayMessage, "client");
                            } else {
                                targetForm.correctError(element, displayMessage);
                            }
                        }
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateDateRangeSameMonthField = function (element, comparisonElement, message) {
            
            //alert(element);
            //alert(comparisonElement);
            //alert(message);

            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'The start date and stop date must be in the same month.');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = $FORMS.Formats.formatDate(element.value);
                    if (comparisonElement.value.length > 0) {
                        comparisonElement.value = $FORMS.Formats.formatDate(comparisonElement.value);
                        if ($VAL.isValidDate(element.value) == true && $VAL.isValidDate(comparisonElement.value) == true) {
                            var elementVal = new Date(element.value);
                            var comparisonElementVal = new Date(comparisonElement.value);
                            if (elementVal.getMonth() !== comparisonElementVal.getMonth() || elementVal.getFullYear() !== comparisonElementVal.getFullYear()) {
                                targetForm.addError(element, displayMessage, 'client', comparisonElement);
                            } else {
                                targetForm.correctError(element, displayMessage);
                            }
                        }
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateDurationField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid, number of hours (999.00)');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = formatDuration(element.value);
                    if ($VAL.isValidDuration(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateEmailField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid email address');
            if (targetForm) {
                if (element.value.length > 0) {
                    if ($VAL.isValidEmail(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateGreaterThanZeroField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'The value you entered must be greater than 0');
            if (targetForm) {
                if (element.value.length > 0) {
                    if (!(parseInt(element.value) > 0)) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateNotEmptyField = function (element, message) {

            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a value');
            if (targetForm) {
                if ($VAL.isEmpty(element) == true) {
                    targetForm.addError(element, displayMessage, "client");
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateNotEmptyListItemField = function (element, message) {

            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a value');
            if (targetForm) {
                if ($VAL.isEmpty(element) == true) {
                    targetForm.addError(element, displayMessage, "client");
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateNumericField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid number');
            if (targetForm) {
                if (element.value.length > 0) {
                    if ($VAL.isNumeric(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateNumericDecimalField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid number');
            if (targetForm) {
                if (element.value.length > 0) {
                    if ($VAL.isNumericDecimal(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };
        $VAL.ValidateNumericRangeField = function (element, comparisonElement, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'The numeric start value must be smaller than the numeric stop value.');
            if (targetForm) {
                if (element.value.length > 0) {
                    if (comparisonElement.value.length > 0) {
                        if ($VAL.isNumeric(element.value) == true && $VAL.isNumeric(comparisonElement.value) == true) {
                            if (Number(element.value) > Number(comparisonElement.value)) {
                                targetForm.addError(element, displayMessage, "client");
                            } else {
                                targetForm.correctError(element, displayMessage);
                            }
                        }
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidatePhoneField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid phone number');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = formatPhone(element.value);
             
                    if ($VAL.isValidPhone(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateSSNField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid social security number');
            if (targetForm) {
                if (element.value != '' && element.value != undefined) {
                    element.value = formatSSN(element.value);
                    if ($VAL.isValidSSN(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateTextRangeField = function (element, comparisonElement, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'The ending text value must be alphabetically after the beginning text value');
            if (targetForm) {
                if (element.value.length > 0) {
                    if (comparisonElement.value.length > 0) {
                        if (element.value > comparisonElement.value) {
                            targetForm.addError(element, displayMessage, "client");
                            //targetForm.addError(comparisonElement, displayMessage, "client");
                        } else {
                            targetForm.correctError(element, displayMessage);
                        }
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateTimeField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
                var displayMessage = (message ? message : 'You must enter a valid time');
            if (targetForm) {
                if (element.value != '') {
                    element.value = formatTime(element.value);
                    if ($VAL.isValidHour(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

        $VAL.ValidateDateAndTimeField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a valid Date and time');
            if (targetForm) {
                if (element.value != '') {

                    element.value = element.value.toString().trim();

                    var datePart1 = element.value.substring(0, element.value.indexOf(" "))
                    var datePart2 = element.value.substring(element.value.indexOf(" "), element.value.length)

                    datePart1 = (datePart1 == "") ? datePart1 : $FORMS.Formats.formatDate(datePart1)
                    datePart2 = (datePart1 == "") ? $FORMS.Formats.formatDate(datePart2) : formatTime(datePart2)
                    element.value = (datePart1 == "") ? datePart2 : datePart1 + " " + datePart2;

                    if ($VAL.isValidDate(datePart2) == false && datePart1 == "") {
                        targetForm.addError(element, displayMessage, "client");
                    } else if (($VAL.isValidHour(datePart2) == false && datePart1 != "") || ($VAL.isValidDate(datePart1) == false && datePart1 != "")) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };

         $VAL.ValidateZipCodeField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'You must enter a 5 or 9 digit zip code');
            if (targetForm) {
                if (element.value != '') {
                     element.value = formatZipCode((element.value).trim());
                    if ($VAL.isValidZipCode(element.value) == false) {
                        targetForm.addError(element, displayMessage, "client");
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
         };

         $VAL.Validate9DigitZipCodeField = function (element, message) {
             var targetForm = $FORMS.findParent(element);
             var displayMessage = (message ? message : 'You must enter a 9 digit zip code');
             if (targetForm) {
                 if (element.value != '') {
                     element.value = formatZipCode((element.value).trim());
                     if ($VAL.isValid9DigitZipCode(element.value) == false) {
                         targetForm.addError(element, displayMessage, "client");
                     } else {
                         targetForm.correctError(element, displayMessage);
                     }
                 } else {
                     targetForm.correctError(element, displayMessage);
                 }
             }
         };

        $VAL.ValidateDefaultValuePropertyField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'Custom property firing for a default value!');
            if (targetForm) {
                targetForm.addError(element, displayMessage, "client");
            }
        };

        $VAL.ValidateRequiredPropertyField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'Custom property firing for a required field!');
            if (targetForm) {
                targetForm.addError(element, displayMessage, "client");
            }
        };


        $VAL.ValidateLockedPropertyField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'Custom property firing for a locked field!');
            if (targetForm) {
                targetForm.addError(element, displayMessage, "client");
            }
        };

        $VAL.ValidateVisiblePropertyField = function (element, message) {
            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'Custom property firing for field visibility!');
            if (targetForm) {
                targetForm.addError(element, displayMessage, "client");
            }
        };

        $VAL.ValidateEnrollmentDateRangeField = function (element, comparisonElement, message) {

            var targetForm = $FORMS.findParent(element);
            var displayMessage = (message ? message : 'The enrollment date cannot occur before the birth date.');
            if (targetForm) {
                if (element.value.length > 0) {
                    element.value = $FORMS.Formats.formatDate(element.value);
                    if (comparisonElement.value.length > 0) {
                        comparisonElement.value = $FORMS.Formats.formatDate(comparisonElement.value);
                        if ($VAL.isValidDate(element.value) == true && $VAL.isValidDate(comparisonElement.value) == true) {
                            var elementVal = new Date(element.value);
                            var comparisonElementVal = new Date(comparisonElement.value);
                            //alert('Start date: ' + elementVal + ', stop date: ' + comparisonElementVal);
                            if (elementVal < comparisonElementVal) {
                                //alert('Date range validation failed');
                                targetForm.addError(element, displayMessage, 'client', comparisonElement);
                                //targetForm.addError(comparisonElement, displayMessage, "client");
                            } else {
                                targetForm.correctError(element, displayMessage);
                            }
                        }
                    } else {
                        targetForm.correctError(element, displayMessage);
                    }
                } else {
                    targetForm.correctError(element, displayMessage);
                }
            }
        };




    } ($APP.Forms.Validation));


}



var formatCurrency = function (strInput) {
    if (strInput.length == 0) {
        return strInput;
    } else {
        var strStripped = strInput.replace(/[a-zA-Z\$]/g, "")
        var intDecLoc = strStripped.indexOf(".");
        if (intDecLoc == -1) {
            strStripped += ".00";
        } else {
            var intDec = strStripped.substring(intDecLoc + 1, intDecLoc + 3);
            if (intDec.length == "1")
                intDec += "0";
            strStripped = strStripped.substring(0, intDecLoc) + "." + intDec;
        }
        //strStripped = "$" + strStripped;
        return strStripped;
    }
}

var formatDuration = function (strInput) {
    if (strInput.length == 0) {
        return strInput;
    } else {
        var strStripped = strInput.replace(/[a-zA-Z\$]/g, "")
        var intDecLoc = strStripped.indexOf(".");
        if (intDecLoc == -1) {
            strStripped += ".00";
        } else {
            var intDec = strStripped.substring(intDecLoc + 1, intDecLoc + 3);
            if (intDec.length == "1")
                intDec += "0";
            strStripped = strStripped.substring(0, intDecLoc) + "." + intDec;
        }
        strStripped = "" + strStripped;
        return strStripped;
    }
}

var formatDate = function (strInput) {
    var re = /^(1[0-2]|0?[1-9])[\-\/](0?[1-9]|[12][0-9]|3[01])[\-\/]((19|20)?\d{2})$/
    if (strInput.length == 0) {
        return strInput;
    } else {
        if (re.test(strInput) == false) {
            var strStripped = strInput.replace(/\D/g, "");
            var intLen = strStripped.length;
            if (intLen == 6) {
                return strStripped.substring(0, 2) + "/" + strStripped.substring(2, 4) + "/" + strStripped.substring(4, 6);
            } else if (intLen == 8) {
                return strStripped.substring(0, 2) + "/" + strStripped.substring(2, 4) + "/" + strStripped.substring(4, 8);
            } else {
                return strInput.replace(/[^0-9/]/g, '');
            }
        } else {
            return strInput.replace(/[^0-9/]/g, '');
        }
    }
}

var formatHour = function (strInput) {
    if (strInput.length == 0) {
        return strInput;
    } else {
        strInput = strInput.toUpperCase();
        var booAMPM = strInput.indexOf("AM");
        if (booAMPM == "-1") {
            booAMPM = strInput.indexOf("PM");
        }
        if (booAMPM == "-1") {
            strInput = strInput.replace(/[a-zA-Z\s]/g, "");
            strInput += " AM";
        }
        return strInput;
    }
}

var formatTime = function (strInput) {
   //remove first '0' if exist in time
  strInput = ((strInput.charAt(0) == '0') ? strInput.substr(1, strInput.length - 1) : strInput);

  if (strInput.length == 0) {
       return strInput;
   } else {
                var strAMPM = strInput.replace(":", "").replace(/[^a-zA-Z]/g, "");
                strAMPM = ((strAMPM.toLowerCase().indexOf("a") === -1) ? "PM" : "AM")
                strInput = strInput.replace(/[^0-9]/g, '');
                    if (strInput.length == 1) {
                        return strInput.substr(0, 1) + ':00' + " " + strAMPM;
                    }
                    else if (strInput.length == 2) {
                        return strInput.substr(0, 2) + ':00' + " " + strAMPM;
                    }
                    else if (strInput.length == 3) {
                        return strInput.substr(0, 1) + ':' + strInput.substr(1, 2) + " " + strAMPM;
                    }
                    else if (strInput.length == 4) {
                        return strInput.substr(0, 2) + ':' + strInput.substr(2, 2) + " " + strAMPM;
                    }
                               
            }
        } 
         
         
var formatPhone = function (strInput) {
    if (strInput.length == 0) {
        return strInput;
    } else {
        var strStripped = strInput.replace(/\D/g, "");
        var intLen = strStripped.length;
        if (intLen == 7) {
            return strStripped.substring(0, 3) + "-" + strStripped.substring(3, 7);
        } else if (intLen == 10) {
            return "(" + strStripped.substring(0, 3) + ") " + strStripped.substring(3, 6) + "-" + strStripped.substring(6, 10);
        } else {
            return strInput;
        }
    }
}

var formatSSN = function (strInput) {
    if (strInput.length == 0) {
        return strInput;
    } else {
        var strStripped = strInput.replace(/\D/g, "");
        var intLen = strStripped.length;
        if (intLen == 9) {
            return strStripped.substring(0, 3) + "-" + strStripped.substring(3, 5) + "-" + strStripped.substring(5, 9);
        } else {
            return strInput;
        }
    }
}

var formatZipCode = function(strInput){
    if (strInput.length == 0) {
        return strInput;
    } else {
        var strStripped = strInput.replace(/\D/g, "");
        var intLen = strStripped.length;
         if (intLen == 9) {
            return strStripped.substring(0, 5) + "-" + strStripped.substring(5, 9);
        } else {
            return strInput;
        }
    }
}