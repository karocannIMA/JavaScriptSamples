
var searchResultOffsetHeight = 0;
var searchResultContentHeight = 0;

var reportsOffsetHeight = 0;
var reportsContentHeight = 0;

var addedRowHeights = [];

scripts.executable.push(function () {

    $('#search_options_button').bind('click', function (event) {
        event.preventDefault();

        var searchOptionsHtmlRef = {};

        if ($('#family_search_options').length > 0) {
            searchOptionsHtmlRef = $('#family_search_options');

        } else if ($('#child_search_options').length > 0) {
            searchOptionsHtmlRef = $('#child_search_options');

        } else if ($('#provider_search_options').length > 0) {
            searchOptionsHtmlRef = $('#provider_search_options');
        }

        if (searchOptionsHtmlRef.css('display') == 'none') {
            searchOptionsHtmlRef.show();
            searchResultOffsetHeight += searchOptionsHtmlRef.height();
        } else {
            searchResultOffsetHeight -= searchOptionsHtmlRef.height();
            searchOptionsHtmlRef.hide();
        }

        resizeSearchResultPanel();
    });


    $('.clear_button').bind('click', function (event) {
        event.preventDefault();
        $('.search_query').val('');
        $('.search_form').submit();
    });


    $('.search_query').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            //alert("ID = " + $('#family_search_form').find('#FamilySearchQuery').val());
            $('#dashboard_search_form').submit();
        }
    });

    var reportCategories = {
        1: '#all_reports_listing',
        2: '#casemanagement_reports_listing',
        3: '#centerbased_reports_listing',
        4: '#familyfee_reports_listing',
        5: '#government_reports_listing',
        6: '#lacounty_reports_listing',
        7: '#projection_reports_listing',
        8: '#providerpayment_reports_listing',
        9: '#trustline_reports_listing'
    };

    $('#report_categories').bind('change', function (event) {
        var currentCategory = $(this).val();

        for (var category in reportCategories) {
            if (category == currentCategory) {
                $(reportCategories[category]).show();
            } else {
                $(reportCategories[category]).hide();
            }
        }
    });

    // Figure out the offset height of the scroll box for search result data.  Then, set and reset this everytime
    // the window height changes so that the list is always as tall as possible without creating a vertical scrollbar.

    registerSearchResultBehaviors($('#browse_records'));

    resizeSearchResultPanel();

    $(window).bind('resize', function (event) {
        resizeSearchResultPanel();
    });


});

var onSearchComplete = function () {
    registerSearchResultBehaviors($('#browse_records'));
    resizeSearchResultPanel();

    if (showSingleRecord) {
        $('.UI_expandable_list div.header').click();
    }

    $APP.UI.hideLoading();
}

var registerSearchResultBehaviors = function (scope) {
    $(scope).find('#search_results li div.header').bind('click', function (event) {
        // Make sure this isn't invoked if the user clicked on a link inside of the TR we've targeted
        if (event.target.tagName != 'A') {
            toggleRow(this);
        }
    });
}

var resizeSearchResultPanel = function () {


    if ($('#browse_records .scroll').length > 0) {
        searchResultOffsetHeight = $('#browse_records .scroll').offset().top + 147;
        searchResultContentHeight = $('#browse_records .scroll').height();
        var calculatedSearchHeight = $(window).height() - searchResultOffsetHeight;
        var calculatedReportsHeight = 0
    }


    //This needs to use the :visible filter because there are two "scroll" classes and only one is shown at a time 

    if ($('#report_list').length > 0) {
        reportsOffsetHeight = $('#report_list .scroll:visible').offset().top + 82;
        reportsContentHeight = $('#report_list .scroll:visible').height();
        calculatedReportsHeight = $(window).height() - reportsOffsetHeight;
    }


    var familyReminderHeight = $('#family_reminders_list_content').height()
    var providerReminderHeight = $("#provider_reminders_list_content").height()

    if (familyReminderHeight > providerReminderHeight) {
        var calculatedRemindersHeight = $('#family_reminders_list_content').height() - 1;
        $('#family_reminders_list_content').css('height', calculatedRemindersHeight + 'px');
        $('#browse_records .scroll').css('height', calculatedSearchHeight + 'px');
        $("#reminders_list_content").css('height', calculatedRemindersHeight + 'px');

        if ($('#report_list').length > 0)
            $('#report_list .scroll').css('height', calculatedReportsHeight + 'px');

    }
    else {
        var calculatedRemindersHeight = $('#provider_reminders_list_content').height() - 1;
        $('#provider_reminders_list_content').css('height', calculatedRemindersHeight + 'px');
        $('#browse_records .scroll').css('height', calculatedSearchHeight + 'px');

        if ($('#report_list').length > 0)
            $('#report_list .scroll').css('height', calculatedReportsHeight + 'px');
    }

}

var toggleRow = function (rowHeader) {

    var parentRow = $(rowHeader).parent();
    var parentList = parentRow.parent();
    var rowContent = parentRow.find('.content');

    if ($(rowHeader).hasClass('selected')) {

        rowContent.show();
        if (rowContent.html().length == 0) {
            $APP.UI.showLoading(parentRow);
            $.get($(parentRow).data('url'), function (data) {
                rowContent.html(data);
                $APP.UI.hideLoading(parentRow);
            });
        }
    }
    resizeSearchResultPanel();
}



