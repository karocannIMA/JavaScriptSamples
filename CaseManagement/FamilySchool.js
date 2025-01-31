var secondsPerMinute = 60;
var minutesPerHour = 60;


var ie = (document.all) ? true : false;

function convertDecHours(intSeconds) {
    var minutes = convertMinutes(intSeconds);
    var hours = minutes / minutesPerHour;
    return hours.toFixed(2);
}

function convertMinutes(intSeconds) {
    return Math.floor(intSeconds / secondsPerMinute);
}

function HMStoSec1(T) { // h:m:s
    var A = T.split(/\D+/);
    if (parseInt(A[0]) == 12) A[0] = '00';
    if (T.indexOf('PM') > 0) A[0] = parseInt(A[0]) + 12;
    Sec = (A[0] * 60 + +A[1]) * 60
    return Sec
}

function HoursDiff(time1, time2) {
    var diff = 0.0;
    time1 = HMStoSec1(time1);
    time2 = HMStoSec1(time2);
    diff = convertDecHours(time2 - time1);
    if (diff < 0) diff = 24.0 + parseFloat(diff);
    return parseFloat(diff)
}

function formattime(control)
    {
    var minhour = 0;        //This and higher is considered 'am'

    var timevalue = new String(control.value);
    var errvalue = new String("");
    
    var minutes = new String("");
    var hours = new String("");
    var ampm = new String("");
    var am = new String("");
    var pm = new String("");

    timevalue = timevalue.toUpperCase();
    if (timevalue.indexOf("A") != -1) am = "AM";
    if (timevalue.indexOf("P") != -1) pm = "PM";
    
    if (timevalue == "")
        {
        errvalue = "Blank";
        }
    
    if (timevalue.indexOf(":")!=-1)
    /*  This is a 'normal' time.  Split it out as necessary.  */
        {
        var tempArray = timevalue.split(":");
        hours = tempArray[0];
        if (isNaN(hours))
        /*  First split is not a valid number, crash out  */
            {
            errvalue = "Yes";
            }
        else
            {
            /*  Make sure the number is between 0 and 23  */
            if ((hours> 23) || (hours <0))
                {
                errvalue = "Yes";
                }
            else
                {
                if (hours> 12)
                    {
                    hours = hours - 12;
                    ampm = "PM";
                    }
                else if (hours == 12)
                    {
                    ampm = "PM";
                    }
                else if (hours == 0)
                    {
                    ampm = "AM";
                    hours = 12;
                    }
                else
                    {
                    if (hours <minhour)
                        {
                        ampm = "PM";        
                        }
                    else
                        {
                        ampm = "AM";
                        }
                    hours = hours;
                    }
                }
            }
        /*  Gen the minutes   */
        minutes = tempArray[1];
        if (minutes.indexOf("a")> -1)
            {
            ampm = "AM";
            minutes = parseInt(minutes);
            }
        else if (minutes.indexOf("p")> -1)
            {
            ampm = "PM";
            minutes = parseInt(minutes);
            }
        else
            {
            minutes = parseInt(minutes);
            }
        /*  Make sure the minutes are in a valid range (00-59)    */
        if (isNaN(minutes))
            {
            errvalue = "Yes";
            minutes = 0;    //Just to make sure for later
            }
        else
            {
            if ((minutes < 0) || (minutes> 59))
                {
                minutes = 0;
                errvalue = "Yes";
                }
            else
                {
                //Minutes is valid
                if (minutes <10)
                    {
                    minutes = "0" + String(minutes);
                    }
                else
                    {
                    minutes = minutes;
                    }
                }
            }
        }

    else
    /*  Have to work a little harder  */
    {

        timevalue = timevalue.replace(/[^0-9]/g, '');
        if (timevalue.length < 3) timevalue += "00";


        if (isNaN(timevalue))
            {
                errvalue = "Yes";       

            }
        else {
            if ((timevalue.length == 3) || (timevalue.length ==4))
                {
                //Get the minutes
                minutes = timevalue.substr((timevalue.length -2), 2);
                if ((minutes>= 0) && (minutes <60))
                    {
                    //Ignore this
                    }
                else
                    {
                    errvalue = "Yes";
                    }
                
                //Get the hours
                hours = timevalue.substr(0, (timevalue.length - 2));
                if ((hours <0) || (hours> 23))
                    {
                    errvalue = "Yes";
                    }
                if (hours <10)
                    {
                    if (timevalue.substr(0,1)=="0")
                        {
                        if (hours == 0)
                            {
                            ampm = "AM";
                            hours = 12;
                            }
                        else
                            {
                            ampm = "AM";
                            }
                        }
                    else
                        {
                        if (hours <minhour)
                            {
                            ampm = "PM";
                            }
                        else
                            {
                            ampm = "AM";
                            }
                        }
                    }
                else
                    {
                    if ((hours == 10) || (hours == 11))
                        {
                        ampm = "AM";
                        }
                    else if (hours == 12)
                        {
                        ampm = "PM";
                        }
                    else
                        {
                        ampm = "PM";
                        hours = hours - 12;
                        }
                    }
                }
            else
                {
                    errvalue = "Yes";
                }
            }
        }
    if (errvalue!="")
    /*  There was an error    */    
        {
        if (TrimString(control.value)!="")
            {
            alert("You appear to have entered an invalid time.");
            control.focus();
            control.select();
            }
        }
    else {
        if (am != "") ampm = "AM";
        if (pm != "") ampm = "PM";
        control.value = (hours * 1) + ":" + minutes + " " + ampm;
        }
    
    }


    function TrimString(sInString) {
        sInString = sInString.replace(/^s+/g, ""); // strip leading
        return sInString.replace(/s+$/g, ""); // strip trailing
    }



function getElementByClass(objClass) {
    //  This function is similar to 'getElementByID' since there
    //  is no inherent function to get an element by it's class
    //  Works with IE and Mozilla based browsers
    var elements = (ie) ? document.all : document.getElementsByTagName('*');
    for (i = 0; i < elements.length; i++) {
        //alert(elements[i].className)
        //alert(objClass)
        if (elements[i].className == objClass) {
            return elements[i]
        }
    }
}

function hideClass(objClass) {
    //  This function will hide Elements by object Class
    //  Works with IE and Mozilla based browsers getElementsByClassName

    // var elements = (ie) ? document.all : document.getElementsByTagName('*');
    var elements = (ie) ? document.all : document.getElementsByClassName(objClass);
    for (i = 0; i < elements.length; i++) {
        if (elements[i].className == objClass) {
            elements[i].style.display = 'none';
            //alert("after hide: " + elements[i].id + " " + elements[i].style.display);
        }
    }
}

function showClass(objClass) {
    //  This function will show Elements by object Class
    //  Works with IE and Mozilla based browsers
    var elements = (ie) ? document.all : document.getElementsByTagName('*');
    for (i = 0; i < elements.length; i++) {
        if (elements[i].className == objClass) {
            elements[i].style.display = "block"
        }
    }
}


function checkday(a, b) {
    $(".SchedDays").css('color', 'black');
    $('#Days' + b).css('color', 'red');
    //$("#DayDesc").html(b);
}


function DisabledEffect() {

    $('#add_entity_dialog').css('z-index', 90);
}

function weekdays(checkbox) {
    if ($(checkbox).is(':checked')) {
        //alert('checked');
        DisabledEffect();

        $.ajax({ url: root+'CaseManagement/FamilySchoolScheduleDetail/WeekdaysPopup',
            type: "get",
            data: "WeeklySchedule=" + "",
            global: false,
            asysn: false,
            success: function (data) {
                var variableScheduleDialog = new $APP.UI.Dialog({
                    id: 'weekdays_dialog',
                    title: 'Variable Schedule Entry',
                    titleColor: 'blue',
                    width: '33%',
                    lightbox: true,
                    iconURL: assets.images + 'icons/edit_16.png',
                    content: data,
                    shadow: true,
                    zindex: '9999'
                });

                variableScheduleDialog.show();

            }
        });


    }
}

