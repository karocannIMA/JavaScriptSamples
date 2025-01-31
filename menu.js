$.ajaxSetup({ cache: false })
$.fn.extend({SwapList: function(options) {

        var allowed = options.allowed;
        var available = options.available;
        //action click events are assigned to button created from helper SwapList
        $('#remove_single').click(function (e) {
            e.preventDefault();
            $('#' + allowed + ' option:selected').appendTo('#' + available);
            $('#' + available +  option).attr('selected', 'selected');
        });//remove single
        
        $('#allow_single').click(function (e) {
            e.preventDefault();
            $('#' + available + ' option:selected').appendTo('#' + allowed);
            $('#' + allowed + option).attr('selected', 'selected');
        });//allow_single

        $('#remove_all').click(function (e) {
            e.preventDefault();
            $('#' + allowed + ' option:selected').appendTo('#' + available);
            $('#' + allowed + ' option').not(':selected').appendTo('#' + available);
        });//remove_all
        $('#allow_all').click(function (e) {
            e.preventDefault();
            $('#' + available + ' option:selected').appendTo('#' + allowed);
            $('#' + available + ' option').not(':selected').appendTo('#' + allowed);
        });//allow_all
}});

$.fn.extend({
    //extend popup menu to jQuery
    //add menu class
    //not working yet (SDR)
    PopupMenu: function() {
        this.each( //iterates over selected ul
            function() {
                $(this).addClass('.menu');           
                
                $(this).hover(
                    function() {//instead of variables stored data in .data (try passing data from controler)
                        $.data(this,'menu',true);
                    },
                    function() {
                        $.data(this,'menu',false);
                    }
            );//hover                    
            
            if(!$.data(document,'pressed')) {
                $.data(document,'pressed',true);
                $(document).mousedown(
                    function() {
                        $('.menu').each(
                            function() {//hide other ui
                                if(!$.data(this,'menu')) {
                                    $(this).hide();
                                }
                            }
                        );//each
                    }//function
                );//mousedown
            }//if(!$.data                                                                                                       

            $(this).parent.bind(
                'contextmenu',
                function($e) {
                    e.preventDefault();
                    
                    //curent ui to display menu
                    var $menu = $(this).find('.menu');
                    
                    $menu.show();
                    
                    var $screenX
                    var $screenY
                    //try all and should work
                    //change to check for browser expicitly.
                    if(self.innerHeight) {
                        $screenX = self.innerWidth;
                        $screenY = self.innerHeight;
                    } else if  (document.documentElement &&
                                document.documentElement.clientHeight) {
                        $screenX = document.documentElement.clientWidth;
                        $screenY = document.documentElement.clientHeight;
                    } else {
                        $screenX = document.body.clientWidth;
                        $screenY = document.body.clientHeight;
                    }
                    
                    $menu.css({
                        top:'auto',                                                                                                                               
                        right:'auto',
                        bottom:'auto',
                        left:'auto'
                    });                        
                
                //fix syntax error
                if ($menu.outerHeight() > ($screenY- $e.pageY)) {                               
                    $menu.css('bottom',($screenY - $e.pageY)+ 'px');
                } else {
                    $menu.css('top',$e.pageY + 'px');
                }                    
            
                if ($menu.outerWidth() > ($screenX - $e.pageX)) {
                    $menu.css('right', ($screenX - $e.pageX) + 'px');
                } else {
                    $menu.css('left', $e.pageX + 'px');
                }
            }
        );
    }
 );               

return $(this);
},

//Extend ActivePopupMenu to jQuery; register PopupMemu via $(document).ready(...)
ActivatePopupMenu: {
    Ready: function() {
        $('ui').PopupMenu();
    }
}


$(document).ready(
    function() {
        $.fn.PopupMenu.Ready();
    }                    
);




    function getX(x) {
        var left = 0;

        if (x.offsetParent) {
            while (1) {
                left += x.offsetLeft;
                if (!x.offsetParent)
                    break;
                x = x.offsetParent;
            }
        } else if (x.x) {
            left += x.x;
        }

	//Keep relavtive to the viewport to cover scrolling forms (property demo and map pages) SDR
        x.style.position = "fixed";

        return left;
    }

    function getY(y) {
        var top = 0;

        if (y.offsetParent) {
            while (1) {
                top += y.offsetTop;
                if (!y.offsetParent)
                    break;
                y = y.offsetParent;
            }
        } else if (y.y) {
            top += y.y;
        }

        return top;
    }

    function getPos(obj) {
        var left = getX(obj);
        var top = getY(obj);

        return [left, top];
    }

    $(document).ready(
        function() {
            $('a').click(
                function(e) {
                    var y = getY(this);
                    $("#editForm").animate({ "top": + y + "px" }, "slow");
                }
            );
        });
