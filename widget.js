$.ajaxSetup({ cache: false })
function SwapList() {

    //Constructor 
    this.lstto = $('.swapListTo');
    this.lstfrom = $('.swapListFrom');

    this.items = [];

}

SwapList.prototype.moveUp = function (t, f) {

    f ^= t ^= f ^= t;
    return [t, f];

};

SwapList.prototype.moveDown = function (f, t) {

    t ^= f ^= t ^= f;
    return [f, t];

};

SwapList.prototype.addAll = function () {
    $(this.lstfrom).children().remove().appendTo(this.lstto);
    this.prepareList();

};

SwapList.prototype.removeAll = function () {
    $(this.lstto).children().remove().appendTo(this.lstfrom)
    this.prepareList();
};

SwapList.prototype.swapFrom = function () {
    $(this.lstfrom).find('option:selected').remove().appendTo(this.lstto);
    this.prepareList();
};

SwapList.prototype.swapTo = function () {
    $(this.lstto).find('option:selected').remove().appendTo(this.lstfrom);
    this.prepareList();
};

SwapList.prototype.prepareList = function () {

    $('.swapListTo').html($('.swapListTo option').sort(function (a, b) {
        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
    }));

    $('.swapListFrom').html($('.swapListFrom option').sort(function (a, b) {
        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
    }));

};

function WIDGET() {return this;}

var WIDGET = WIDGET || new WIDGET();

WIDGET.init = function (ctl) {
    switch (ctl.toLowerCase()) {
        case 'swaplist':
            initSwapList();
            break;
        default:
            break;
    }
}

WIDGET.SwapList() = function (args) {
    //todo: create swaplist here
    // pass in object literal
    return this;
}

function initSwapList() {
    
    if ($('.swapListFrom') && $('.swapListTo')) {

        $(document).ready(function () {

            // try adding to APP.UI instead of global ns
            var SWAPLIST = SWAPLIST || new SwapList();

            $('#addSwapList').click(function (e) {
                e.preventDefault();
                SWAPLIST.swapFrom();
            });

            $('#removeSwapList').click(function (e) {
                e.preventDefault();
                SWAPLIST.swapTo();

            });

            $('#addAllSwapList').click(function (e) {
                e.preventDefault();
                SWAPLIST.addAll();
            });

            $('#removeAllSwapList').click(function (e) {
                e.preventDefault();
                SWAPLIST.removeAll();
            });
        });
    } else {

        alert('Must declare multi-select lists with .swapListFrom and .swapListTo class specifiers.');
    }
}