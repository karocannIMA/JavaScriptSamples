$.ajaxSetup({ cache: false })
if ($APP) {

    //
    // BEGIN NAMESPACE: $APP.Forms.CustomProperties
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    $APP.namespace('$APP.Forms.CustomProperties');
    $APP.Forms.CustomProperties = (function () {
        return {
            init: function () {
                $APP.log('$APP.Forms.CustomProperties.init() started');
                $APP.Forms.CustomProperties.registerNewContent();
                $APP.log('$APP.Forms.CustomProperties.init() finished');
            }
        }
    } ());

    $APP.initializers.push($APP.Forms.CustomProperties.init);

    $APP.Forms.CustomProperties.fieldColors = {
        locked: '#EFEFEF',
        required: '#FFFFCC'
    };

    (function ($PROP) {

        var $FORMS = $APP.Forms;

        $PROP.registerNewContent = function (scope) {
            $APP.log('$APP.Forms.CustomProperties.registerNewContent(), finding forms...');
            $APP.Forms.CustomProperties.bindProperties(scope);
            $APP.log('$APP.Forms.CustomProperties.registerNewContent(), complete');
        };
        $APP.contentRegistrars.push($PROP.registerNewContent);

        // 
        // Public function: "bindProperties"
        // Binds validation functions to elements that have validations defined.

        $PROP.bindProperties = function (scope) {
            $APP.log('$APP.Forms.CustomProperties.bindProperties() started');
            var n = 0;
            scope = scope || document;

            $(scope).find('.element_data').each(function (i, obj) {

                var dataElements = obj.value.split('[:::]');
                var parentForm = $FORMS.findParent($('#' + dataElements[0]));

                if (parentForm && dataElements.length == 3) {
                    if (dataElements[1].indexOf('Property') != -1) {

                        $APP.log('$APP.Forms.bindProperties.bindProperties(), binding ' + dataElements[1] + 'Field to ' + dataElements[0]);

                        var propertyIndex = parentForm.customProperties.push({
                            field: dataElements[0],
                            type: dataElements[1],
                            message: dataElements[2],
                            func: function () {
                                var fieldRef = $('#' + dataElements[0]).get(0);
                                var messageRef = $('#' + dataElements[0]).data(dataElements[1]);
                                $APP.Forms.CustomProperties[dataElements[1]](fieldRef, messageRef);
                            }
                        });

                        var property = parentForm.customProperties[propertyIndex - 1];
                        property.func();

                        n++;
                    }
                }
            });


            $APP.log('$APP.Forms.CustomProperties.bindProperties() finished, ' + n + ' properties binded.');
        };

        $PROP.reapplyProperties = function (targetForm) {
            // if a targetForm was passed in, check to see that the element belongs
            // to the targetForm.
            if (targetForm) {
                var properties = targetForm.customProperties;
                for (var i = 0; i < properties.length; i++) {
                    properties[i].func();
                }
            }
            $APP.log('$APP.Forms.CustomProperties.reapplyProperties() complete');
        };

        $PROP.SetDefaultValueProperty = function (element, message) {
            if ($(element).is(':checkbox')) {
                var default_checked;
                if (typeof (message) == 'string') {
                    message = message.toLowerCase();
                }
                switch (message) {
                    case true:
                    case "true":
                    case 1:
                    case "1":
                    case -1:
                    case "-1":
                    case "on":
                    case "yes":
                        default_checked = true;
                        break;
                    default:
                        default_checked = false;
                        break;
                }
                $(element).attr('checked', default_checked);
            } else {
                $(element).val(message);
            }
        };

        $PROP.SetInputMaskProperty = function (element, message) {
            var mask = message

            if (mask.indexOf("00000\\-0000;;") != -1 || mask.indexOf("00000\-0000;;") != -1 || mask.indexOf("00000\\-9999;;_") != -1 || mask.indexOf("00000-9999;;___") != -1 || mask.indexOf("00000\-9999;;___") != -1) { //ZipCode
                $(element).unbind('blur');
                $(element).blur(function (event) {
                    $APP.Forms.Validation.Validate9DigitZipCodeField(element)
                });
            }
        };

        $PROP.SetRequiredProperty = function (element, message) {
            $(element).css('background-color', $APP.Forms.CustomProperties.fieldColors.required);
            $(element).blur(function (event) {
                $APP.Forms.Validation.ValidateNotEmptyField(element, message);
            });
        };

        $PROP.SetMaxLengthProperty = function (element, message) {
            $(element).blur(function (event) {
                var targetForm = $FORMS.findParent(element);
                var maxLength = message.replace(/\D/g, '');
                var currLength = $(this).val().length

                if (targetForm) {
                    if (currLength > maxLength) {
                        targetForm.addError(element, message, "client");
                    } else {
                        targetForm.correctError(element, message);
                    }
                }
            });
        };

        $PROP.SetLockedProperty = function (element, message) {
            $(element).css('background-color', $APP.Forms.CustomProperties.fieldColors.locked);
            var initialVal = $(element).val();

            if ($(element).is(':checkbox'))
                initialVal = ($(element).is(':checked')) ? "true" : "false";

            $(element).change(function (event) {
                alert('This field is locked.');

                if ($(element).is(':checkbox')) {
                    switch (initialVal) {
                        case "true":
                            $(element).attr("checked", true); break;
                        case "false":
                            $(element).removeAttr("checked"); break;
                    }
                } else {
                    $(element).val(initialVal);
                }
            });
        };

        $PROP.SetVisibleProperty = function (element, message) {
            // Set "display:none" so the elements will not appear at all and others will shift up

            $("label[for='" + element.id + "']").hide();
            $(element).hide();

            // Hide the elements but preserve the spacing - may be a better option to avoid weird quirks
            //$("label[for='" + element.id + "']").css('visibility', 'hidden');
            //$(element).css('visibility', 'hidden');
        };

    } ($APP.Forms.CustomProperties));
}



