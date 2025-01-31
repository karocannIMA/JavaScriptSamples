$.ajaxSetup({ cache: false })
if ($APP) {
    

    //
    // BEGIN NAMESPACE: $APP.Forms.Formats
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    $APP.namespace('$APP.Forms.Formats');
    $APP.Forms.Formats = (function () {
        return {
            init: function () {
                // no need to report anything until something is performed in init()
                $APP.log('$APP.Forms.Validation.Formats.init() started');
                $APP.log('$APP.Forms.Validation.Formats.init() finished');
            }
        }
    } ());
    $APP.initializers.push($APP.Forms.Formats.init);

    (function ($FMTS) {

        var $FORMS = $APP.Forms;
        var $VAL = $APP.Forms.Validation;

        $FMTS.formatCurrency = function (strInput) {
            if (strInput.length == 0) {
                return strInput;
            } else {
                var strStripped = strInput.toString().replace(/[a-zA-Z\$]/g, "")
                strStripped = strStripped.replace(/\(/, '-');
                strStripped = strStripped.replace(/\)/, '');

                //if (Number.isNaN(strStripped)) {
                if (isNaN(strStripped)) {
                    return NaN;
                } else {
                    var value = Number(strStripped);
                    value = value.toFixed(2);
                    return '$' + value;
                }
                //var intDecLoc = strStripped.indexOf(".");

                //if (intDecLoc == -1) {
                //    strStripped += ".00";
                //} else {

                //    if (intDecLoc == 0) {
                //        intDecLoc = intDecLoc + 1;
                //        strStripped = "0" + strStripped;
                //    }

                //    var roundedStr = parseFloat(strStripped).toFixed(2)
                //    var intDec = roundedStr.substring(intDecLoc + 1, intDecLoc + 3);
                //    if (intDec.length == "1")
                //        intDec += "0";
                //    strStripped = strStripped.substring(0, intDecLoc) + "." + intDec;
                //}
                //strStripped = "$" + strStripped;
                //return strStripped;
            }
        }

        $FMTS.formatDuration = function (strInput) {
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

        $FMTS.formatDate = function (strInput) {

            if (typeof strInput != 'undefined') {
                if (strInput.length == 0) {
                    return strInput;
                } else {
                    if ($VAL.isValidDate(strInput) == false) {
                        var strStripped = strInput.replace(/\D/g, "");
                        var intLen = strStripped.length;
                        if (intLen == 6) {
                            var year = strStripped.substring(4, 6);
                            if ($VAL.isNumeric(year) == true) {
                                if (Number(year) < 50) {
                                    year = '20' + year;
                                } else {
                                    year = '19' + year;
                                }
                            }
                            return strStripped.substring(0, 2) + "/" + strStripped.substring(2, 4) + "/" + year;
                        } else if (intLen == 8) {
                            return strStripped.substring(0, 2) + "/" + strStripped.substring(2, 4) + "/" + strStripped.substring(4, 8);
                        } else if (intLen == 7) {
                            return strStripped.substring(0, 1) + "/" + strStripped.substring(1, 3) + "/" + strStripped.substring(3, 7);
                        } else {
                            return strInput;
                        }
                    }

                    else if ($VAL.isValidDate(strInput) == true && strInput.substring(strInput.lastIndexOf("/") + 1, strInput.length).length == 2) {
                        var year = strInput.substring(strInput.lastIndexOf("/") + 1, strInput.length)
                        if ($VAL.isNumeric(year) == true) {
                            if (Number(year) < 50) {
                                year = '20' + year;
                            } else {
                                year = '19' + year;
                            }
                        }
                        strInput = strInput.substring(0, strInput.lastIndexOf("/") + 1) + year;
                        return strInput;
                    }
                    else {
                        return strInput;
                    }
                }
            }
        }

        $FMTS.formatHour = function (strInput) {
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

        $FMTS.formatPhone = function (strInput) {
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

        $FMTS.formatSSN = function (strInput) {
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

        $FMTS.formatTime = function (strInput) {

            //remove first '0' if exist in time
            strInput = ((strInput.charAt(0) == '0') ? strInput.substr(1, strInput.length - 1) : strInput);

            if (strInput.length == 0) {
                return strInput;
            } else {
                var strAMPM = strInput.replace(":", "").replace(/[^a-zA-Z]/g, "");
                //strAMPM = (strAMPM == "") ? "AM" : strAMPM;
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

        $FMTS.formatZipCode = function (strInput) {
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

    } ($APP.Forms.Formats));

}



