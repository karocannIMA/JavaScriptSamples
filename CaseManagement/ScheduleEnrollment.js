var registerScheduleListingBehaviors = function (scope) {
    $(scope).find('#schedule_listing table tbody tr').hover(
		function (event) {
		    if (!$(this).hasClass('selected')) $(this).addClass('hover');
		},
		function (event) {
		    if (!$(this).hasClass('selected')) $(this).removeClass('hover');
		}
	);

	$(scope).find('#schedule_listing table tbody tr.summary_row').bind('click', function (event) {
        // Make sure this isn't invoked if the user clicked on a link inside of the TR we've targeted
        if (event.target.tagName != 'A') {
            toggleRow(this);
        }
    });
}

var toggleRow = function (row) {
    var paymentType = $(row).attr('id').replace(/schedule_summary_/, '');

    if (!$(row).hasClass('selected')) {
        $(row).addClass('selected');
        $('tr#schedule_totals_' + paymentType).addClass('selected');
        $('tr#schedule_detail_' + paymentType).show();
    } else {
        $(row).removeClass('selected');
        $('tr#schedule_totals_' + paymentType).removeClass('selected');
        $('tr#schedule_detail_' + paymentType).hide();
    }
}

function calculateTotals(paymentTypeCode) {
    if (paymentTypeCode == '01' || paymentTypeCode == '02') {
        $.post($('#schedule_detail_list_' + paymentTypeCode).data('callback_url'), function (data) {
            $('#total_weekly_hours_' + paymentTypeCode).html(data.TotalWeeklyHours.toFixed(2) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            $('#evening_weekend_percentage_' + paymentTypeCode).html((data.EveningWeekendPercentage * 100).toFixed(2) + '%');

            //RMR
            $('.RMR').html('');
            for (i = 0; i < data.Exceptions.length; i++) {
                if (data.Exceptions[i].MarketRate != null) {
                    if (data.Exceptions[i].MarketRate.length > 0) {
                        $('#RMR_' + data.Exceptions[i].CareTimeCode + '_' + data.Exceptions[i].ScheduleDetailID).html('$' + data.Exceptions[i].MarketRate);
                    }
                }
            };
        });
    }
}