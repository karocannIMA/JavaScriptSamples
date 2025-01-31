$.ajaxSetup({ cache: false })
if ($APP) {

    //
    // BEGIN NAMESPACE: $APP.UI
    // Steven Russell 3/13/2013
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    var processingAddRecord;

    $APP.namespace('$APP.UI');
    $APP.UI = (function () {
        // Note: this function requires fully qualified references to itself as the function
        // is passed to another as an arguement below, in "$APP.initializers.push($APP.UI);"
        return {
            init: function () {
                $APP.log('$APP.UI.init() started');
                $APP.UI.registerNewContent(document);
                $APP.log('$APP.UI.init() finished');
            }
        }
    } ());
    $APP.initializers.push($APP.UI.init);

    $APP.UI.registerNewContent = function (scope) {
        $APP.UI.ButtonHovers.register(scope);
        $APP.UI.CancelButtons.register(scope);
        $APP.UI.CloseButtons.register(scope);
        $APP.UI.EditableLists.register(scope);
        $APP.UI.ExpandableLists.register(scope);
        $APP.UI.MainMenu.register(scope);
        $APP.UI.NavigationRollups.register(scope);
        $APP.UI.RegisterExpandableDialogs(scope);
        $APP.UI.RegisterLabelCloseButtons(scope);
        $APP.UI.PagedLists.register(scope);
        $APP.UI.SubformNavigation.register(scope);
        $APP.UI.showNotice(scope);

        $APP.UI.SubformNavigationBtns();

        $APP.log('$APP.UI.registerNewContent() complete');
    };
    $APP.contentRegistrars.push($APP.UI.registerNewContent);

    $APP.UI.centerObject = function (element) {
        var position = {
            left: ($(window).width() / 2) - ($(element).width() / 2),
            top: ($(window).height() / 2) - ($(element).height() / 2)
        };
        $APP.UI.setPosition(element, position);
    }

    $APP.UI.hideLoading = function (container) {
        $(container).find('.loading_background').hide();
        $(container).find('.loading_message').hide();
    };

    $APP.UI.registerDialogDragging = function (dialog) {
        if ($(dialog).hasClass('draggable')) {
            $(dialog).draggable({ handle: 'h3.handle' });
            $(dialog).find('h3.handle').disableSelection();
        }

     if ($(dialog).hasClass('resizeable')) {

         $(dialog).resizable({ alsoResize: $("#report_frame"),minHeight: '596', minHeight: '596', minWidth: '963' });

        $(dialog).bind('resize', function (event) {
            var reportPopUp = $("#report_frame").parent().parent();
            var contentPanel = $("#report_frame").parent();
            var documentPanel = $('#report_frame iframe');

            //remove panel image and replace it with same color background
            $(contentPanel).removeClass('html_panel_content')
            $("#report_frame").parent().parent().css({ 'background-color': '#EEEEEE' });
            $("#report_frame").parent().parent().css({ 'box-shadow': '10px 10px 5px #888888' });

            //remove 100% size restrain so the report viewer can expand
            $("#report_frame").parent().parent().removeClass('html_panel_shadow_width_100')
            $(reportPopUp).find('h3').css('background-color', '#0099FF');


            $(reportPopUp).children('h3').css({ 'width': $("#report_frame").width() + 18 });
            $(documentPanel).css({ 'height': $("#report_frame").height() + 1 });
            $(reportPopUp).css({ 'height': $(reportPopUp).height() + 30 });

            $("#report_frame").css({ 'margin-left': '20px' });
        });
     }
 }


    $APP.UI.showNotice = function (scope) {
        // Only show the notice if it contains anything meaningful.  It will contain 
        // whitespace characters if nothing else, so we're testing against that.
        if (/[A-Za-z0-9]+/.test($('#notice div').html())) {
            $('#notice').show();
        }
    };
    

    $APP.UI.showLoading = function (container) {
        container = $(container);
        var loadingScreen = container.find('.loading');
        if (loadingScreen.length == 0) {
            html = "<div class='loading_background'></div><div class='loading_message'><img src='" + assets.images + "ajax-loader.gif' />Loading...<div>";
            loadingScreen = $(html);
            container.append(loadingScreen);
        }
        loadingScreen.show();
    }

    $APP.UI.setNoticeTimer = function () {
        window.setTimeout(function () {
            $('#notice').fadeOut('medium');
        }, 4000);
    }

    $APP.UI.setPosition = function (element, position) {
        if (position.top) $(element).css("top", position.top);
        if (position.right) $(element).css("right", position.right);
        if (position.bottom) $(element).css("bottom", position.bottom);
        if (position.left) $(element).css("left", position.left);
    }

    // Expandable Lists
    $APP.UI.ExpandableLists = (function () {
        var _expandableLists = function () {
            this.register = function (scope) {

                if (!scope) scope = $(document);

                var expandableLists = $(scope).find('ul.UI_expandable_list');

                if (expandableLists.length > 0) {
                    expandableLists.each(function (idx, list) {

                        $(list).find('div.header').click(function (event) {

                                var preventToggleFromLink = false;
                            if (event.target.tagName == 'A') {
                                if (!$(event.target).hasClass('anchor')) {
                                    preventToggleFromLink = true;
                                }
                            }

                            if (!preventToggleFromLink) {
                                var listing = $APP.findParentByClassName(this, 'UI_expandable_list');
                                var restrictToOneRow = ($(listing).data('restrictToOneRow') == 'false') ? false : true;

                                var content = $(this).parent().find('.content');
                                var allContent = $(this).parent().parent().find('.content');
                                var allHeaders = $(this).parent().parent().find('div.header');

                                if ($(this).hasClass('selected')) {
                                    $(this).removeClass('selected');
                                    $(this).find('.icon_Small_SingleUpArrow').removeClass('icon_Small_SingleUpArrow').addClass('icon_Small_SingleDownArrow');
                                    content.hide();

                                    //icon_Small_SingleUpArrow
                                    //icon_Small_SingleDownArrow

                                } else {
                                    if (restrictToOneRow) {
                                        allHeaders.removeClass('selected');
                                        allHeaders.find('.icon_Small_SingleUpArrow').removeClass('icon_Small_SingleUpArrow').addClass('icon_Small_SingleDownArrow');
                                        allContent.hide();
                                    }

                                    $(this).addClass('selected');
                                    $(this).find('.icon_Small_SingleDownArrow').removeClass('icon_Small_SingleDownArrow').addClass('icon_Small_SingleUpArrow');
                                    content.show();
                                }
                            }
                        });
                    });
                }

                $APP.log('$APP.UI.ExpandableLists.register() complete, ' + expandableLists.length + ' found.');
            }
        }
        return new _expandableLists;
    } ());




    // Constructor function
    $APP.UI.Button = (function () {
        var _button = function (label, id, iconUrl, importance) {
            this.label = label;
            this.id = id;
            this.iconUrl = iconUrl;
            this.importance = importance;
        };
        _button.prototype = {
            toHtml: function () {
                this.importance = (this.importance == 'high') ? 'html_button_importance_high' : 'html_button_importance_normal';
                html = '';
                html += "<div id=\"" + this.id + "\" class=\"html_button html_button_white " + this.importance + "\">";
                html += "<input type=\"image\" value=\"" + this.label + "\" src=\"" + assets.images + "blank.png\" name=\"" + this.id + "\"/>";
                html += "<div class=\"inner_content\"><span class=\"label\"><img src=\"" + this.iconUrl + "\" />" + this.label + "</span></div>";
                html += "</div>";
                return html;
            }
        }
        return _button;
    } ());

    // Registration helper
    $APP.UI.ButtonHovers = (function () {
        var _buttonHovers = function () {
            this.register = function (scope) {

                // accepts scope as a parameter so the applied functionality can be sand-boxed.
                if (!scope) scope = $(document);

                var html_button_importance_normal_hover = function (event) {
                    var container = ($(this).hasClass('html_button_importance_normal')) ? this : $(this).parent();
                    if (!$(container).hasClass('selected')) $(container).addClass('html_button_blue').removeClass('html_button_white');
                };

                var html_button_importance_high_hover = function (event) {
                    var container = ($(this).hasClass('html_button_importance_high')) ? this : $(this).parent();
                    if (!$(container).hasClass('selected')) $(container).addClass('html_button_orange').removeClass('html_button_white');
                };

                var html_button_hoverout = function (event) {
                    var container = ($(this).hasClass('html_button') || $(this).hasClass('html_button_link')) ? this : $(this).parent();
                    if (!$(container).hasClass('selected')) $(container).addClass('html_button_white').removeClass('html_button_blue html_button_orange');
                };

                $(scope).find('.html_button_importance_normal input, a.html_button_importance_normal').hover(html_button_importance_normal_hover, html_button_hoverout);
                $(scope).find('.html_button_importance_normal input, a.html_button_importance_normal').focus(html_button_importance_normal_hover);
                $(scope).find('.html_button_importance_normal input, a.html_button_importance_normal').blur(html_button_hoverout);

                $(scope).find('.html_button_importance_high input, a.html_button_importance_high').hover(html_button_importance_high_hover, html_button_hoverout);
                $(scope).find('.html_button_importance_high input, a.html_button_importance_high').focus(html_button_importance_high_hover);
                $(scope).find('.html_button_importance_high input, a.html_button_importance_high').blur(html_button_hoverout);

                $(scope).find('.html_button').each(function (button) {
                    if ($(this).hasClass('show_status_indicator')) {
                        $(this).click(function (event) {
                            $(this).find('span.label').html($(this).find('.status_indicator_text').html());
                        });
                    }
                });
            }
        }
        return new _buttonHovers;
    } ());

    // Registration Helper
    // *** this might not be necessary ***
    $APP.UI.CancelButtons = (function () {
        var _cancelButtons = function () {
            this.register = function (scope) {
                // accepts scope as a parameter so the applied functionality can be sand-boxed.
                if (!scope) scope = $(document);
                var cancelButtons = $(scope).find('.cancel_button');
                if (cancelButtons.length > 0) {
                    cancelButtons.each(function (idx, cancelButton) {
                        var parent = $APP.findParentByClassName(cancelButton, 'html_panel_shadow');
                        var errorSummaryID = $(parent).find('form').data('ErrorSummary');
                        var errorSummaryUIRef = $APP.Errors.Summaries.find(errorSummaryID);

                        if (parent != false) {
                            $(cancelButton).bind('click', function (event) {
                                event.preventDefault();
                                if (errorSummaryUIRef != false)
                                    errorSummaryUIRef.removeAllErrors();
                                parent.remove();	
                                //parent.hide();
                                //ui.hideLightbox();
                            });
                        }
                    });
                }
            }
        }
        return new _cancelButtons;
    } ());

    // Registration helper
    $APP.UI.CloseButtons = (function () {
        var _closeButtons = function () {
            this.register = function (scope) {
                // accepts scope as a parameter so the applied functionality can be sand-boxed.
                // if nothing is passed in, $(document) is used.
                if (!scope) scope = $(document);

                // obtain an array of all closeButtons in the given scope.
                var closeButtons = $(scope).find('.close_button');

                // only proceed if some are found.
                if (closeButtons.length > 0) {
                    $APP.log('$APP.UI.CloseButtons.register(), ' + closeButtons.length + ' close button(s) found');
                    closeButtons.each(function (idx, closeButton) {
                        // since close buttons should only be found in pop-ups, perform a search
                        // on parent elements until 'html_panel_shadow' is found, since this indicates
                        // a popup.
                        var parent = $APP.findParentByClassName(closeButton, 'html_panel_shadow');
                        var errorSummaryID = $(parent).find('form').data('ErrorSummary');
                        var errorSummaryUIRef = $APP.Errors.Summaries.find(errorSummaryID);

                        if (parent != false) {

                            var removeOnClose = $(closeButton).data('removeonclose') || '';
                            var hideLightBox = $(closeButton).data('hidelightbox') || '';

                            if (removeOnClose.toLowerCase() == "true") {

                                // if 'removeonclose' has been set, bind a function that will remove
                                // the popup from the document when closed.
                                $(closeButton).bind('click', function (event) {
                                    $APP.log('$APP.CloseButtons dialog closed [removeonclose]');
                                    event.preventDefault();

                                    if ($(parent).find('#id_undo_changes').is(":visible")) {
                                        if ($('#confirm_close').css('display') != 'block') {

                                            var confirmDialog = new $APP.UI.Confirm({
                                                id: "confirm_close",
                                                message: "<strong>Continue without Saving?</strong>",
                                                lightbox: false,
                                                onConfirm: function () {
                                                    if (errorSummaryUIRef != false)
                                                        errorSummaryUIRef.removeAllErrors();
                                                    parent.remove();
                                                    if (hideLightBox.toLowerCase() != 'false') $APP.UI.Lightbox.hide();
                                                    sessionStorage.setItem('isDirty', false);
                                                }
                                            });
                                            confirmDialog.show();

                                        }
                                    } else {
                                        if (errorSummaryUIRef != false)
                                            errorSummaryUIRef.removeAllErrors();
                                        parent.remove();
                                        if (hideLightBox.toLowerCase() != 'false') $APP.UI.Lightbox.hide();
                                    }
                                });
                            } else {
                                // if 'removeonclose' wasn't set or is false, bind a function that 
                                // will hide the popup only (it will still exist in the document 
                                // and can be shown again).
                                $(closeButton).bind('click', function (event) {
                                    $APP.log('$APP.CloseButtons dialog closed');
                                    event.preventDefault();
                                    if (errorSummaryUIRef != false)
                                        errorSummaryUIRef.removeAllErrors();
                                    // parent.hide();
                                    parent.remove();
                                    $APP.UI.Lightbox.hide();
                                });
                            }
                        }
                    });
                }
                $APP.log('$APP.UI.CloseButtons.register() complete');
            }
        }
        return new _closeButtons;
    } ());


    $APP.UI.ConfirmDialogs = (function () {
        var _dialogs = [];
        _dialogs.find = function (id) {
            for (var i = 0; i < this.length; i++) {
                if (this[i].id == id) {
                    return this[i];
                }
            }
            return false;
        };
        _dialogs.remove = function (id) {
            for (var i = 0; i < this.length; i++) {
                if (this[i].id == id) {
                    this[i].id = '';
                    return true;
                }
            }
            return false;
        };
        return _dialogs;
    } ());


    $APP.UI.Confirm = function (options) {

        var _confirm = function (options) {

            this.showYesButton = (options.showYesButton == undefined) ? true : options.showYesButton;
            this.showNoButton = (options.showNoButton == undefined) ? true : options.showNoButton;

            if (this.showYesButton) {
                this.yesIcon = (options.yesIcon == undefined) ? assets.images + 'icons/checkmark_16.png' : options.yesIcon;
                this.yesLabel = (options.yesLabel == undefined) ? 'Yes' : options.yesLabel;
                this.yesImportance = (options.yesImportance == undefined) ? 'normal' : this.yesImportance;
                if (options.onConfirm) this.onConfirm = options.onConfirm;
            }

            if (this.showNoButton) {
                this.noIcon = (options.noIcon == undefined) ? assets.images + 'icons/cancel_16.png' : options.noIcon;
                this.noLabel = (options.noLabel == undefined) ? 'No' : options.noLabel;
                this.noImportance = (options.noImportance == undefined) ? 'normal' : this.noImportance;
                if (options.onCancel) this.onCancel = options.onCancel;
            }

            this.params = options || {};

            // this.content: content displayed in the dialog
            this.message = options.message || "";

            // this.id: the element ID for the dialog's HTML
            if (!options.id) {
                alert('You must set an ID for the dialog!');
                return false;
            } else {
                this.id = options.id;
            }

            this.shadow = (options.shadow == undefined) ? false : options.shadow;
            this.zindex = (options.zindex == undefined) ? '9999' : options.zindex;
            this.lightbox = (options.lightbox == undefined) ? true : options.lightbox;

            // this.handlerRegistration: function that can be executed the first time the dialog is created
            this.handlerRegistration = options.handlerRegistration || function () { return true; };

            $APP.UI.ConfirmDialogs.push(this);
        }

        _confirm.prototype = {
            remove: function () {
                $('#' + this.id).remove();
                $APP.UI.ConfirmDialogs.remove(this.id);
                $APP.log('$APP.UI.Confirm.remove() complete');
            },
            show: function () {
                var confirm = $('#' + this.id);
                var newConfirm = false;

                if (confirm.length == 0) {
                    newConfirm = true;

                    html = "<div id=\"" + this.id + "\" class=\"html_dialog html_dialog_auto html_dialog_shadow html_dialog_confirm\">";
                    html += "<div class=\"html_dialog_surface\"><div class=\"html_dialog_outercontainer\"'><div class=\"html_dialog_innercontainer\"><div class=\"html_dialog_content iefloatfix\">";


                    html += "<p class=\"message\">" + this.message + "</p>";



                    html += "<div class=\"buttons\">";

                    if (this.showYesButton) {
                        html += new $APP.UI.Button(this.yesLabel, this.id + "_yes", this.yesIcon, this.yesImportance).toHtml();
                    }

                    if (this.showNoButton) {
                        html += new $APP.UI.Button(this.noLabel, this.id + "_no", this.noIcon, this.noImportance).toHtml();
                    }


                    //var yesButton = new $APP.UI.Button(this.yesLabel, this.id + "_yes", this.yesIcon, this.yesImportance);
                    //var noButton = new $APP.UI.Button(this.noLabel, this.id + "_no", this.noIcon, this.noImportance);

                    //html += yesButton.toHtml() + noButton.toHtml();

                    html += "</div>";
                    html += "</div></div></div></div>";
                    html += "</div>";

                    confirm = $(html);

                    // set some css properties
                    confirm.css("z-index", this.zindex);
                    confirm.css("display", "none");
                    confirm.css("position", "absolute");

                    confirm.find('#' + this.id + '_yes').bind('click', function (event) {
                        var confirmRef = $APP.UI.ConfirmDialogs.find(this.id.replace(/_yes/, ''));
                        if (confirmRef.onConfirm) confirmRef.onConfirm(confirmRef.params);
                        confirmRef.remove();
                        if (confirmRef.lightbox) $APP.UI.Lightbox.hide();
                    });

                    confirm.find('#' + this.id + '_no').bind('click', function (event) {
                        //if (options.onCancel) options.onCancel();
                        var confirmRef = $APP.UI.ConfirmDialogs.find(this.id.replace(/_no/, ''));
                        if (confirmRef.onCancel) confirmRef.onCancel(confirmRef.params);
                        confirmRef.remove();
                        $APP.UI.Lightbox.hide();
                    });

                    $APP.log('$APP.UI.Confirm created');
                }

                // show the lightbox, if specified and then show the dialog
                if (this.lightbox) $APP.UI.Lightbox.show();
                $('body').append(confirm);

                // center it
                $APP.UI.centerObject(confirm);

                confirm.show();

                if (newConfirm) {
                    $APP.registerNewContent(confirm);
                    $APP.UI.registerDialogDragging(confirm);
                }

                $APP.log('$APP.UI.Confirm.show() complete');
            }
        }

        var _newConfirm = new _confirm(options);
        _newConfirm.show();
        return _newConfirm;
    };


    $APP.UI.Dialogs = (function () {
        var _dialogs = [];
        _dialogs.register = function (scope) {
            $APP.log('$APP.UI.Dialogs.register() complete');
            return false;
        };
        return _dialogs;
    } ());


    $APP.UI.Dialog = (function () {
        var _dialog = function (options) {

            // this.content: content displayed in the dialog
            this.content = options.content || "";

            // this.height: set an approxmate height for the dialog
            this.height = options.height || false;
            if (this.height != false) {
                this.heightType = 'html_panel_fixed_height';
            } else {
                this.heightType = 'html_dialog_auto';
            }
           
            // this.iconURL: URL for an icon that displays to the left of the title on the dialog
            this.iconURL = options.iconURL || false;

            // this.id: the element ID for the dialog's HTML
            if (!options.id) {
                alert('You must set an ID for the dialog!');
                return false;
            } else {
                this.id = options.id;
            }

            // this.lightBox: toggles the lightbox effect in the window
            this.lightbox = options.lightbox || true;

            // this.handlerRegistration: function that can be executed the first time the dialog is created
            this.handlerRegistration = options.handlerRegistration || function () { return true; };

            // this.shadow: 
            this.shadow = options.shadow || true;

            // this.title: the title that's displayed in the title bar of the dialog
            this.title = options.title || '';

            // this.titleColor: sets the color of the dialog title bar.
            options.titleColor = options.titleColor || 'blue';
            var validColors = ['blue', 'green', 'orange', 'purple', 'yellow'];
            if ($.inArray(options.titleColor, validColors) < 0) {
                alert('You must specify a valid value for [color].  Acceptable colors are blue, green, orange, purple and yellow');
                return false;
            } else {
                this.titleColor = options.titleColor;
            }

            // this.width: make sure a valid width was supplied.
            options.width = options.width || '100%';
            var validWidths = ['fullscreen', '100%', '80%', '66%', '50%', '33%'];
            if ($.inArray(options.width, validWidths) < 0) {
                alert('You must specify a valid value for [width].  Acceptable widths are fullscreen, 100%, 80%, 66%, 50% and 33%');
                return false;
            } else {
                this.width = options.width;
            }

            // this.zindex: 
            this.zindex = options.zindex || '9999';

            //this.resize: determine if dialog should be resizeable
            this.resize = options.resize

            $APP.UI.Dialogs.push(this);
        }

        _dialog.prototype = {
            hide: function () {
                var dialog = $('#' + this.id);
                dialog.hide();
                if (this.lightbox) $APP.UI.Lightbox.hide();
                $APP.log('$APP.UI.Dialog.hide() complete');
            },
            show: function () {
                var dialog = $('#' + this.id);
                var newDialog = false;
                if (dialog.length == 0) {
                    newDialog = true;
                    // Remove the % sign from the specified width as this will be used in the panel class names
                    this.width = this.width.replace(/%/, '');

                    // Create the panel color class name
                    var titleColor = 'html_panel_' + this.titleColor;

                    var panelClasses = (this.shadow == false) ? 'html_panel html_panel_width_' + this.width : 'html_panel_shadow html_panel_shadow_width_' + this.width + ' ' + this.heightType;
                    var resizeable = (this.resize ==true)? ' resizeable ' : ''


                    html = '<div id="' + this.id + '" class="' + panelClasses + resizeable +' draggable"' + '>';
                    html += '<h3 class="' + titleColor + ' handle"><img src="' + this.iconURL + '" class="icon" />' + this.title + '</h3>';
                    html += '<div class="html_panel_content iefloatfix ' + this.heightType + '">';
                    html += this.content;
                    html += '</div></div>';

                    dialog = $(html);
                    $APP.log('$APP.UI.Dialog created');
                }

                // set some css properties
                if (this.height != false) dialog.css("height", this.height);
                dialog.css("z-index", this.zindex);
                dialog.css("display", "none");
                dialog.css("position", "absolute");

                // show the lightbox, if specifiied and then show the dialog
                if (this.lightbox) $APP.UI.Lightbox.show();
                $('body').append(dialog);

                // center it
                $APP.UI.centerObject(dialog);

                dialog.show();

                if (newDialog) {
                    $APP.registerNewContent(dialog);
                    $APP.UI.registerDialogDragging(dialog);
                }

                if (this.handlerRegistration) this.handlerRegistration();
                $APP.log('$APP.UI.Dialog.show() complete');
            }
        }
        return _dialog;
    } ());


    $APP.UI.PagedLists = (function () {

        var _pagedListings = [];

        _pagedListings.register = function (scope) {
            $APP.log('$APP.UI.PagedLists.register() started');
            var lists = $(scope).find('.paged_list');
            lists.each(function (i, element) {
                $APP.UI.PagedLists.push(new $APP.UI.PagedList(element));
            });
            $APP.log('$APP.UI.PagedLists.register() finished, ' + this.length + ' found.');
        };

        _pagedListings.find = function (id) {
            for (var i = 0; i < this.length; i++) {
                if (this[i].id == id) {
                    return this[i];
                }
            }
            return false;
        };

        _pagedListings.findParent = function (element) {
            var parentList = $APP.findParentByClassName(element, 'paging_navigation');
            if (parentList.length > 0) {
                parentList = parentList.get(0);
                for (var i = 0; i < this.length; i++) {
                    if (this[i].navigationHtmlRef === parentList) {
                        return this[i];
                    }
                }
                return false;
            } else {
                return false;
            }
        };

        return _pagedListings;
    } ());


    $APP.UI.PagedList = (function () {

        var _pagedList = function (htmlRef) {

            this.id = $(htmlRef).data('id');
            this.setReferences(htmlRef);
            this.registerLinks();
            this.pageLoadCount = 0;
            $(this.iframeHtmlRef).attr('src', $(this.htmlRef).data('initialUrl'));
        };

        _pagedList.prototype = {
            registerLinks: function () {
                $(this.navigationHtmlRef).find('.back_button,.rewind_button, .forward_button, .fast_forward_button, .page_link').click(function (event) {
                    event.preventDefault();

                    if (!$(this).hasClass("disabled")) {
                        var listUIRef = $APP.UI.PagedLists.findParent(this);

                        $APP.UI.showLoading($('#' + listUIRef.id));
                        //$APP.UI.showLoading(listUIRef);
                        var url = $(this).find('a').attr('href');

                        $.ajax({
                            url: url,
                            cache: false,
                            success: function (data) {
                                var result = $('<div>').html(data);
                                var newPagedListHtmlRef = $(data).find('.paged_list').attr('id');
                                $(listUIRef.htmlRef).html($(result).find('#' + listUIRef.id).html());
                                $(listUIRef.navigationHtmlRef).html($(result).find('.paging_navigation').html());
                                $APP.elementData.register();
                                $APP.registerNewContent($(listUIRef.htmlRef));
                                $APP.registerNewContent($(listUIRef.navigationHtmlRef));
                                listUIRef.setReferences(document.getElementById(listUIRef.id));
                                listUIRef.registerLinks();
                                if ($(listUIRef.htmlRef).data('callback') != undefined) {
                                    eval($(listUIRef.htmlRef).data('callback'));
                                }
                                $APP.UI.hideLoading();
                            }
                        });
                    } 
                });
            },

            setReferences: function (htmlRef) {

                this.htmlRef = htmlRef;
                this.initialUrl = $(this.htmlRef).data('initialUrl');

                this.iframeHtmlRef = $('#' + this.id + '_loader');
                if (this.iframeHtmlRef.length == 0) {
                    alert('Iframe reference not found for paged list: ' + this.id + '!');
                    return false;
                } else {
                    this.iframeHtmlRef = this.iframeHtmlRef.get(0);
                }

                this.navigationHtmlRef = $('#' + this.id + '_navigation');
                if (this.navigationHtmlRef.length == 0) {
                    alert('navigation reference not found for paged list: ' + this.id + '!');
                    return false;
                } else {
                    this.navigationHtmlRef = this.navigationHtmlRef.get(0);
                }

            }
        };

        return _pagedList;
    } ());


    $APP.UI.EditableLists = (function () {

        var _editableLists = [];

        _editableLists.currentItemInfo = {};

        _editableLists.find = function (listName) {
            for (var i = 0; i < this.length; i++) {
                if (this[i].htmlRef.id == listName) {
                    return this[i];
                }
            }
            return false;
        };

        _editableLists.findFromMultiple = function (listName) {
            for (var i = 0; i < this.length; i++) {
                if (this[i].htmlRef.id == listName && $(this[i].htmlRef).is(":visible")) {
                    return this[i];
                }
            }
            return false;
        };

        _editableLists.findParent = function (element) {
            
            var parentList = $APP.findParentByClassName(element, 'editable_list');
            if (parentList == false) parentList = $APP.findParentByClassName(element, 'inline_editable_list');

            if (parentList.length > 0) {
                parentList = parentList.get(0);
                for (var i = 0; i < this.length; i++) {
                    if (this[i].htmlRef === parentList) {
                        return this[i];
                    }
                }
                return false;
            } else {
                return false;
            }
        };

        _editableLists.register = function (scope) {
            $APP.log('$APP.UI.EditableLists.register() started');
            var lists = $(scope).find('.inline_editable_list, .editable_list');
            lists.each(function (i, element) {
                $APP.UI.EditableLists.push(new $APP.UI.EditableList(element));
                $APP.Errors.registerServerErrors();
            });
            $APP.log('$APP.UI.EditableLists.register() finished, ' + this.length + ' found.');
        };

        return _editableLists;
    } ());


    $APP.UI.EditableList = (function () {

        var _editableList = function (htmlRef) {

            this.htmlRef = htmlRef;
            this.id = this.htmlRef.id;

            this.errorSummaryID = '';
            this.errorSummaryUIRef = '';

            if ($(this.htmlRef).data('ErrorSummary') != undefined) {
                this.errorSummaryID = $(this.htmlRef).data('ErrorSummary');
                this.errorSummaryUIRef = $APP.Errors.Summaries.find(this.errorSummaryID);
                $APP.Errors.ApplyReportingInterface(this);
            }

            this.load = true;

            if ($(this.htmlRef).data('Load') != undefined) {
                if ($(this.htmlRef).data('Load').toLowerCase() == 'true') {
                    this.load = true;
                } else {
                    this.load = false;
                }
            }

            this.listURL = '';
            this.listType = ($(this.htmlRef).hasClass('editable_list')) ? 'editable_list' : 'inline_editable_list';

            if (this.load) {
                if (this.setURLs()) {
                    this.loadListContent();
                    $APP.log('$APP.UI.EditableList() created');
                } else {
                    $APP.log('$APP.UI.EditableList() failed');
                }
            } else {
                $APP.UI.hideLoading(this.htmlRef);
                $APP.Errors.registerServerErrors();
            }
        };

        _editableList.prototype = {

            // Hides the add link row.  Only one is ever used in the course of an inline list being displayed.
            // It is only shown or hidden, at various times. There is an additional, related function, "showAddLinkRow".
            hideAddLinkRow: function () {
                $(this.htmlRef).find('.add_entity_link').hide();
            },

            // this function hides any loading animation currently displayed in any list button. Loading animations are
            // shown in many of the buttons on the listing, but only one is ever shown at a time. There is an additional,
            // related function, "showButtonLoadingAnimation()".
            hideButtonLoadingAnimation: function () {
                $(this.htmlRef).find('.inline_button_loading').removeClass('inline_button_loading').addClass('inline_button_add'); ;
            },

            // Show pop-up or inline add row
            addRecord: function (processing) {
                if ($('.with_inline', window.parent.document).length) {
                    window.parent.$('.with_inline :input').attr('disabled', 'disabled');
                     $('.with_inline', window.parent.document).css({ "opacity": "0.3" });
                }

                // Obtain a reference to the list object in the UI namespace and the physical element via
                // jquery as well
                var listUIObject = this;
                var parentList = $(listUIObject.htmlRef);

                // Obtain a reference to the add button
                var addButtonRef = parentList.find('li.add_entity_link .inline_button_add');

                // Resolve the URL if a liveUrl is setup
                var url = $APP.resolveLiveURL(addButtonRef);
                if (url == false) {
                    alert('* A valid URL was not supplied!');
                    return false;
                }

                listUIObject.showButtonLoadingAnimation('add_link_row', 'add_button');

                // Switch based on the list being inline or a popup
                switch (listUIObject.listType) {
                    case 'editable_list':
                        $APP.log('$APP.UI.EditableList.registerInlineButtons(), setting props for [editable_list]');


                        $.ajax({
                            url: url,
                            cache: false,
                            success: function (data) {
                                var newDialog = new $APP.UI.Dialog({
                                    id: 'add_entity_dialog',
                                    title: $(parentList).data('dialog_title'),
                                    titleColor: 'blue',
                                    width: $(parentList).data('dialog_width'),
                                    lightbox: true,
                                    iconURL: assets.images + 'icons/edit_16.png',
                                    content: data,
                                    shadow: true
                                });

                                if (!newDialog) {
                                    return false
                                } else {
                                    newDialog.show();
                                }
                                processingAddRecord = false;

                                listUIObject.hideButtonLoadingAnimation();
                            }
                        });
                        break;
                        
                    case 'inline_editable_list':
                        $APP.log('$APP.UI.EditableList.registerInlineButtons(), setting props for [inline_editable_list]');
                        if ($APP.Forms.activeInlineForm == true) {
                            alert('You may only work on one item at a time.');
                            return false;
                        }
                            $.get(url, function (data) {

                                //prevent row display if user has no add rights
                                var errorSummaryObjectRef = $(data).find(".validation_error_summary")
                                var formObjectRef = $(data).find('form')
                                var validationInputRef = $(formObjectRef).find("input")
                                var validationErrorMsgObjRef = ($(validationInputRef).val().indexOf("Security") > 0) ? $(validationInputRef).val() : null

                                var isSecurityError = false, securityErrorMsg = "";
                                var validationErrorMsgRef


                                if ($(errorSummaryObjectRef).find(".html_dialog_content p").html() != null && validationErrorMsgObjRef != null) {
                                    isSecurityError = ($(errorSummaryObjectRef).find(".html_dialog_content p").html().toString().indexOf('security') > -1) ? true : false;
                                    securityErrorMsg = $(errorSummaryObjectRef).find(".html_dialog_content p").html()
                                    validationErrorMsgRef = validationErrorMsgObjRef.split("[:::]")
                                    validationErrorMsg = validationErrorMsgRef[2]
                                }

                                if (isSecurityError) {
                                    var confirmDialog = $APP.UI.Confirm({
                                        id: "security_message",
                                        message: "<strong>" + securityErrorMsg.toString().replace(":", ".") + "<br><br>" + validationErrorMsg + "</strong>",
                                        showNoButton: false,
                                        yesLabel: 'Continue'
                                    });
                                    confirmDialog.show();
                                    listUIObject.hideButtonLoadingAnimation();
                                }
                                else {

                                    var newAddFormRow = $(data);
                                    listUIObject.insertAddFormRow(newAddFormRow);
                                    listUIObject.hideAddLinkRow();
                                    $APP.Forms.activeInlineForm = true;
                                    listUIObject.hideButtonLoadingAnimation();
                                    eval($(listUIObject.htmlRef).data('callback'));

                                    processingAddRecord = false;

                                }
                            });
                        break;
                }
            },

            registerRow: function (row) {
                this.registerAddButton();
                this.registerEditButtons();
                this.registerDeleteButtons();
                this.registerMemoLinks();
                $APP.registerNewContent(row);
            },

            // Inserts a form for creating a new item.
            insertAddFormRow: function (newRow) {
                var addLinkRow = $(this.htmlRef).find('.add_entity_link');

                newRow.insertAfter(addLinkRow);
                this.registerAddInlineFormButtons(newRow);
                this.registerInlineTabOrder(newRow);
                this.registerMemoLinks();
                $APP.registerNewContent(newRow);
                newRow.show();
            },

            insertEditFormRow: function (existingShowRow, newRow) {
                newRow.insertAfter(existingShowRow);
                this.registerEditInlineFormButtons(newRow);
                this.registerInlineTabOrder(newRow);
                this.registerMemoLinks();
                $APP.registerNewContent(newRow);
                newRow.show();
            },

            insertEditedRow: function (existingShowRow, editedRow) {
                editedRow.insertAfter(existingShowRow);
                this.registerRow(editedRow);
                //$APP.registerNewContent(editedRow);
                editedRow.show();
            },

            insertShowRow: function (newRow) {
                var addRow = $(this.htmlRef).find('.add_entity');
                newRow.insertAfter(addRow);
                this.registerRow(newRow);
                //$APP.registerNewContent(newRow);
                newRow.show();
            },

            loadListContent: function () {
                var listUIRef = this;

                $APP.UI.showLoading(listUIRef.htmlRef);

                $.ajax({
                    url: listUIRef.listURL,
                    type: 'GET',
                    cache: false,
                    success: function (data) {
                        var siblingElement = $(listUIRef.htmlRef).find('.add_entity_link');
                        var rowContent = $(data);
                        listUIRef.removePrevListContent();
                        siblingElement.after(rowContent);
                        $APP.elementData.register();
                        $APP.UI.hideLoading(listUIRef.htmlRef);
                        listUIRef.registerAddButton();
                        listUIRef.registerEditButtons();
                        listUIRef.registerDeleteButtons();
                        listUIRef.registerMemoLinks();
                        $APP.registerNewContent(listUIRef.htmlRef);
                        $APP.Errors.registerServerErrors();

                        eval($(listUIRef.htmlRef).data('callback'));
                    }
                });
                $APP.Forms.activeInlineForm = false;
                $APP.log('$APP.UI.EditableList.loadListContent() complete');
            },

            refreshList: function () {
                list = $(this.htmlRef);
                if (list.hasClass('inline_editable_list') || list.hasClass('editable_list')) {

                    // Resolve the URL if a liveUrl is setup.
                    var listUrl = $APP.resolveLiveURL(list);
                    if (listUrl == false) {
                        alert('A valid URL was not supplied!');
                        return false;
                    }

                    // if we have error reporting, hide it first
                    if (this.errorSummaryRef)
                        if (this.errorSummaryRef != false) this.errorSummaryRef.hide();

                    // Remove all existing entities that are shown in the list and then add the loading LI's.
                    list.find('.show_entity').remove();
                    var siblingElement = list.find('.add_entity_link');
                    siblingElement.after("<li class='loading_background'></li><li class='loading_message'><img src='" + assets.images + "ajax-loader.gif' />Loading...</li>");
                    var listRef = this;
                    $.ajax({
                        url: listUrl,
                        type: 'GET',
                        cache: false,
                        success: function (data) {
                            data = $(data);
                            siblingElement.after(data);
                            $APP.registerNewContent(data);
                            listRef.registerAddButton();
                            listRef.registerEditButtons();
                            listRef.registerDeleteButtons();
                            listRef.registerMemoLinks();
                            $APP.UI.hideLoading(listRef.htmlRef);
                        }
                    });
                    $APP.log('$APP.UI.EditableList.refreshList() complete');
                }
            },

            registerAddButton: function () {
                // Make a reference to this list
                var listRef = this;

                // Obtain a reference to the add button
                var addButtonRef = $(this.htmlRef).find('li.add_entity_link .inline_button_add');
                if (addButtonRef.length > 0) {

                    // Make sure we don't register the event more than once
                    if (addButtonRef.data('events') == undefined) {
                        addButtonRef.bind('click', function (event) {

                            // This button is located in the top row of the list, the 'add_entity_link' row.
                            // When the user clicks this button, it will show the form for adding a new item and
                            // will hide this one.
                            event.preventDefault();

                      
                            if (!processingAddRecord) {
                                processingAddRecord = true;
                                listRef.addRecord();
                            };
                           

                            /* if ($('.with_inline', window.parent.document).length) {
                            window.parent.$('.with_inline :input').attr('disabled', 'disabled');
                            $('.with_inline', window.parent.document).css({ "opacity": "0.3" });
                            }

                            // Obtain a reference to the list object in the UI namespace and the physical element via
                            // jquery as well
                            var listUIObject = $APP.UI.EditableLists.findParent(this);
                            var parentList = $(listUIObject.htmlRef);

                            // Resolve the URL if a liveUrl is setup
                            var url = $APP.resolveLiveURL(this);
                            if (url == false) {
                            alert('* A valid URL was not supplied!');
                            return false;
                            }

                            listUIObject.showButtonLoadingAnimation('add_link_row', 'add_button');

                            // Switch based on the list being inline or a popup
                            switch (listUIObject.listType) {
                            case 'editable_list':
                            $APP.log('$APP.UI.EditableList.registerInlineButtons(), setting props for [editable_list]');

                            $.ajax({
                            url: url,
                            cache: false,
                            success: function (data) {
                            var newDialog = new $APP.UI.Dialog({
                            id: 'add_entity_dialog',
                            title: $(parentList).data('dialog_title'),
                            titleColor: 'blue',
                            width: $(parentList).data('dialog_width'),
                            lightbox: true,
                            iconURL: assets.images + 'icons/edit_16.png',
                            content: data,
                            shadow: true
                            });

                            if (!newDialog) {
                            return false
                            } else {
                            newDialog.show();
                            }
                            listUIObject.hideButtonLoadingAnimation();
                            }
                            });
                            break;

                            case 'inline_editable_list':
                            $APP.log('$APP.UI.EditableList.registerInlineButtons(), setting props for [inline_editable_list]');
                            if ($APP.Forms.activeInlineForm == true) {
                            alert('You may only work on one item at a time.');
                            return false;
                            }
                            $.get(url, function (data) {
                            var newAddFormRow = $(data);
                            listUIObject.insertAddFormRow(newAddFormRow);
                            listUIObject.hideAddLinkRow();
                            $APP.Forms.activeInlineForm = true;
                            listUIObject.hideButtonLoadingAnimation();
                            });
                            break;
                            } */
                        });
                    }
                }
                $APP.log('$APP.UI.EditableList.registerAddButtons() complete');
            },

            registerAddInlineFormButtons: function (scope) {

                var processing = false; // used to prevent multi-clicks

                // Register cancel button (for add)
                $(scope).find('.inline_button_cancel').each(function (index, element) {

                    $(element).bind('click', function (event) {
                        event.preventDefault();

                        if ($('.with_inline', window.parent.document).length) {
                            window.parent.$('.with_inline :input').attr('disabled', false);
                            $('.with_inline', window.parent.document).css({ "opacity": "1" });
                        }

                        var parentList = $APP.UI.EditableLists.findParent(this);
                        if (parentList != false) {
                            parentList.showAddLinkRow();
                            parentList.hideButtonLoadingAnimation();
                            parentList.removeAddFormRow();
                        }
                        $APP.Forms.activeInlineForm = false;
                    });
                });

                // Register save button (for add)
                $(scope).find('.inline_button_save').each(function (index, element) {

                    $(element).bind('click', function (event) {
                        event.preventDefault();

                        var listUIObject = $APP.UI.EditableLists.findParent(this);
                        var formUIObject = $APP.Forms.findParent(this);
                        var parentList = $(listUIObject.htmlRef);
                        var elementCallbackFunction = $(element).data('callback');
                        var warningFunction = $(this).data("warning");
                        var allowSubmission = true;

                       

                        // Resolve the URL if a liveUrl is setup

                        $APP.elementData.register();

                        var url = $APP.resolveLiveURL(this);

                        if (url == false) {
                            alert('A valid URL was not supplied!');
                            return false;
                        }
                        if (warningFunction != undefined) {
                            allowSubmission = eval(warningFunction);
                        }

                        formUIObject.scanForErrors();

                        if (!formUIObject.hasClientSideErrors() && allowSubmission == true) {
                            listUIObject.showButtonLoadingAnimation('add_row', 'save_button');

                            $(this).attr("disabled", true);
                            // Process the posting of the new item.  If the new item contains the "Add" view, then it means
                            // that something failed and that an error needs to be displayed.  Otherwise, we'll just add the new
                            // item to the listing and show the Add link again.

                            if ($(this).data('disableAjax') != 'True') {
                                $.post(url, parentList.find('.add_entity form').serialize(), function (data) {

                                    var returnedRow = $(data);

                                    if (returnedRow.hasClass('add_entity')) {

                                        // The save failed and we're being returned the add form so that the user may try again...
                                        // Remove the original add form row and then add the one that was returned with the error info
                                        listUIObject.removeAddFormRow()
                                        listUIObject.insertAddFormRow(returnedRow);
                                        eval(elementCallbackFunction);


                                    } else if (returnedRow.hasClass('show_entity')) {

                                        // everything went well.  now we'll insert our new content and show the add link again.
                                        returnedRow.addClass('new_entity');
                                        listUIObject.insertShowRow(returnedRow);
                                        listUIObject.removeAddFormRow();
                                        listUIObject.showAddLinkRow();
                                        listUIObject.removeAllErrors();
                                        //                                        listUIObject.refreshList();
                                        window.parent.$('.with_inline :input').attr('disabled', false);
                                        $('.with_inline', window.parent.document).css({ "opacity": "1" });
                                        $APP.Forms.activeInlineForm = false;
                                        eval(parentList.data('callback'));
                                        eval(elementCallbackFunction);
                                    }
                                });

                            } else {
                                //check for file size if any uploaded
                                var fi = document.querySelectorAll("input[type=file]")

                                if (fi[0].files.length > 0) {
                                    var fsize = (((fi[0].files.item(0).size) / 1024) / 1024) / 1024; //file size in bytes

                                    if (fsize > 1) { // change to 1 GB
                                        var confirmDialog = $APP.UI.Confirm({
                                            id: "datesError_message",
                                            message: "<strong>File size cannot exceed 1 GB.</strong><br><br>",
                                            showNoButton: false,
                                            yesLabel: 'OK',
                                            onConfirm: function () {
                                                listUIObject.removeAddFormRow();
                                                listUIObject.showAddLinkRow();
                                                listUIObject.removeAllErrors();
                                                $APP.Forms.activeInlineForm = false;
                                                listUIObject.refreshList();

                                        }
                                        });
                                        confirmDialog.show();
                                    }else{
                                        formUIObject.htmlRef.submit();
                                    }
                                } else {
                                    formUIObject.htmlRef.submit();
                                }
                            }
                        }
                        if ($('.with_inline', window.parent.document).length) {
                            //window.parent.$('.with_inline :input').attr('disabled', false);
                            //$('.with_inline', window.parent.document).css({ "opacity": "1" });

                            //give user an option to undo inline list (only if it uses a temp table)
                            if ($('.with_temp_inline', window.parent.document).length)
                                window.parent.$('#undo_changes').show();
                        }
                    });
                });
                $APP.log('$APP.UI.EditableList.registerAddFormButtons() complete');

            },

            registerEditButtons: function () {
                var listRef = this;
                var processing = false;

                $(this.htmlRef).find('li.show_entity .inline_button_edit').each(function (index, element) {

                    // Make sure we don't register more than one event
                    if ($(element).data('events') == undefined) {
                        $(element).bind('click', function (event) {
                            event.preventDefault();

                            if ($('.with_inline', window.parent.document).length) {
                                window.parent.$('.with_inline :input').attr('disabled', 'disabled');
                                $('.with_inline', window.parent.document).css({ "opacity": "0.3" });
                            }

                            var listUIObject = $APP.UI.EditableLists.findParent(this);
                            var parentList = $(listUIObject.htmlRef);
                            var showRow = $APP.findParentByClassName(this, 'show_entity');

                            // Resolve the URL if a liveUrl is setup
                            var url = $APP.resolveLiveURL(element);
                            if (url == false) {
                                alert('A valid URL was not supplied!');
                                return false;
                            }

                            switch (listUIObject.listType) {
                                case 'editable_list':
                                    //listUIObject.showButtonLoadingAnimation('add_link_row', 'add_button');
                                    showRow.find('.inline_button_edit').removeClass('inline_button_edit').addClass('inline_button_loading');


                                    $.ajax({
                                        url: url,
                                        cache: false,
                                        success: function (data) {
                                            var newDialog = new $APP.UI.Dialog({
                                                id: 'add_entity_dialog',
                                                title: $(parentList).data('dialog_title'),
                                                titleColor: 'blue',
                                                width: $(parentList).data('dialog_width'),
                                                lightbox: true,
                                                iconURL: assets.images + 'icons/edit_16.png',
                                                content: data,
                                                shadow: true
                                            });
                                            if (!newDialog) {
                                                return false
                                            } else {
                                                newDialog.show();
                                            }
                                            showRow.find('.inline_button_loading').removeClass('inline_button_loading').addClass('inline_button_edit');
                                        }
                                    });

                                    break;

                                case 'inline_editable_list':

                                    if ($APP.Forms.activeInlineForm == true) {
                                        alert('You may only edit one inline item at a time.');
                                        return false;
                                    }

                                    if (!processing) {
                                        showRow.find('.inline_button_edit').removeClass('inline_button_edit').addClass('inline_button_loading');
                                        processing = true;

                                        $.ajax({
                                            url: url,
                                            cache: false,
                                            success: function (data) {

                                                //prevent row display if user has no add rights
                                                var errorSummaryObjectRef = $(data).find(".validation_error_summary")
                                                var formObjectRef = $(data).find('form')
                                                var validationInputRef = $(formObjectRef).find("input")


                                                var isSecurityError = false, securityErrorMsg = "";
                                                var validationErrorMsgRef

                                                if ($(validationInputRef).html() != null)
                                                    var validationErrorMsgObjRef = ($(validationInputRef).val().indexOf("Security") > 0) ? $(validationInputRef).val() : null

                                                if ($(errorSummaryObjectRef).find(".html_dialog_content p").html() != null && validationErrorMsgObjRef != null) {
                                                    isSecurityError = ($(errorSummaryObjectRef).find(".html_dialog_content p").html().toString().indexOf('security') > -1) ? true : false;
                                                    securityErrorMsg = $(errorSummaryObjectRef).find(".html_dialog_content p").html()
                                                    validationErrorMsgRef = validationErrorMsgObjRef.split("[:::]")
                                                    validationErrorMsg = validationErrorMsgRef[2]
                                                }

                                                if (isSecurityError) {
                                                    var confirmDialog = $APP.UI.Confirm({
                                                        id: "security_message",
                                                        message: "<strong>" + securityErrorMsg.toString().replace(":", ".") + "<br><br>" + validationErrorMsg + "</strong>",
                                                        showNoButton: false,
                                                        yesLabel: 'Continue'
                                                    });
                                                    confirmDialog.show();
                                                    listUIObject.hideButtonLoadingAnimation();
                                                }
                                                else {
                                                    var newEditRow = $(data);
                                                    newEditRow.insertAfter(showRow);
                                                    showRow.hide();
                                                    newEditRow.show();
                                                    listRef.registerEditInlineFormButtons(newEditRow);
                                                    $APP.registerNewContent(newEditRow);
                                                    listRef.registerInlineTabOrder(newEditRow);
                                                    $APP.Forms.activeInlineForm = true;
                                                    eval($(listUIObject.htmlRef).data('callback'));
                                                    processing = false;
                                                }
                                            }
                                        });

                                        break;
                                    }
                            }
                        });
                    }
                });
                $APP.log('$APP.UI.EditableList.registerEditButtons() complete');
            },

            registerEditInlineFormButtons: function (scope) {

                var listRef = this;

                var processing = false; // used to prevent multi-clicks

                // Register cancel button (for editing)
                $(scope).find('.inline_button_cancel').each(function (index, element) {

                    $(element).bind('click', function (event) {
                        event.preventDefault();

                        if ($('.with_inline', window.parent.document).length) {
                            $('.with_inline', window.parent.document).find('input, textarea, button, select').attr('disabled', false);
                            $('.with_inline', window.parent.document).css({ "opacity": "1" });
                        }


                        var listUIObject = $APP.UI.EditableLists.findParent(this);
                        var parentList = $(listUIObject.htmlRef);

                        var editRow = $APP.findParentByClassName(this, 'edit_entity');
                        var showRow = parentList.find('#' + $(editRow).attr('id').replace('edit', 'show'));
                        showRow.find('.inline_button_loading').removeClass('inline_button_loading').addClass('inline_button_edit');
                        $(showRow).show();
                        $(editRow).remove();
                        $APP.Forms.activeInlineForm = false;
                    });
                });

                // Edit/Save button (for editing)
                $(scope).find('.inline_button_save').each(function (index, element) {

                    $(element).bind('click', function (event) {

                        event.preventDefault();

                        var listUIObject = $APP.UI.EditableLists.findParent(this);
                        var formUIObject = $APP.Forms.findParent(this);
                        var parentList = $(listUIObject.htmlRef);
                        var saveCallbackFunction = $(this).data('callback');
                        var warningFunction = $(this).data("warning");
                        var allowSubmission = true;

                        var parentForm = $APP.findParentByClassName(this, 'edit_entity_form');
                        var editFormRow = $APP.findParentByClassName(this, 'edit_entity');
                        var showRow = parentList.find('#' + $(editFormRow).attr('id').replace('edit', 'show'));

                        // Resolve the URL if a liveUrl is setup
                        var url = $APP.resolveLiveURL(this);
                        if (url == false) {
                            alert('A valid URL was not supplied!');
                            return false;
                        }
                        if (warningFunction != undefined) {
                            allowSubmission = eval(warningFunction);
                        }

                        formUIObject.scanForErrors();

                        if (!formUIObject.hasClientSideErrors() && allowSubmission == true) {
                            listUIObject.showButtonLoadingAnimation('edit_row', 'save_button');

                            if ($(this).data('disableAjax') != 'True') {

                                $.post(url, parentForm.serialize(), function (data) {
                                    var returnedRow = $(data);

                                    if (returnedRow.hasClass('edit_entity')) {

                                        // The save failed and we're being returned the edit form so that the user may try again...
                                        // Remove the original edit form row and then add the one that was returned with the error info
                                        listUIObject.removeEditFormRow(editFormRow);
                                        listUIObject.insertEditFormRow(showRow, returnedRow);
                                        eval(saveCallbackFunction);


                                    } else if (returnedRow.hasClass('show_entity')) {

                                        // everything went well.  now we'll insert our new content
                                        returnedRow.addClass('new_entity');
                                        listUIObject.insertEditedRow(showRow, returnedRow);
                                        listUIObject.removeShowRow(showRow);
                                        listUIObject.removeEditFormRow(editFormRow);
                                        $APP.registerNewContent(returnedRow);
                                        listUIObject.hideButtonLoadingAnimation();
                                        listUIObject.removeAllErrors();
                                        //                                        listUIObject.refreshList();
                                        window.parent.$('.with_inline :input').attr('disabled', false);
                                        $('.with_inline', window.parent.document).css({ "opacity": "1" });
                                        $APP.Forms.activeInlineForm = false;
                                        eval(parentList.data('callback'));
                                        eval(saveCallbackFunction);
                                    }
                                });

                            } else {
                                formUIObject.htmlRef.submit();
                            }
                        }
                        if ($('.with_inline', window.parent.document).length) {
                            //window.parent.$('.with_inline :input').attr('disabled', false);
                            //$('.with_inline', window.parent.document).css({ "opacity": "1" });

                            //give user an option to undo inline list (only if it uses a temp table)
                            if ($('.with_temp_inline', window.parent.document).length)
                                window.parent.$('#undo_changes').show();
                        }
                    });

                });
                $APP.log('$APP.UI.EditableList.registerEditFormButtons() complete');
            },

            registerDeleteButtons: function () {
                $(this.htmlRef).find('li.show_entity .inline_button_delete').each(function (index, element) {
                    // Make sure we don't register more than one event
                    if ($(element).data('events') == undefined) {
                        $(element).bind('click', function (event) {
                            event.preventDefault();
                            var parentForm = $APP.findParentByClassName(this, 'delete_entity_form');
                            var parentList = $APP.findParentByClassName(this, 'editable_list');
                            if (parentList == false) parentList = $APP.findParentByClassName(this, 'inline_editable_list');
                            var deleteCallbackFunction = $(this).data('callback');

                            if ($APP.Forms.activeInlineForm == true && parentList.attr('class') == 'inline_editable_list') {
                                alert('You may only edit one inline item at a time.');
                                return false;
                            }

                            var showRow = $APP.findParentByClassName(this, 'show_entity');
                            var editRow = parentList.find('#' + $(showRow).attr('id').replace('show', 'edit'));

                            // Resolve the URL if a liveUrl is setup
                            var url = $APP.resolveLiveURL(this);
                            if (url == false) {
                                alert('* A valid URL was not supplied!');
                                return false;
                            }

                            showRow.css('background-color', '#FFFFCE');

                            // set some info with the EditableLists global object for the current delete.
                            // the confirmation dialog object will need this.
                            $APP.UI.EditableLists.currentItemInfo = {
                                url: url,
                                parentList: parentList,
                                parentForm: parentForm,
                                showRow: showRow,
                                editRow: editRow
                            };

                            var confirmDialog = $APP.UI.Confirm({
                                id: "confirm_delete",
                                message: "<strong>Are you sure you want to delete this item?</strong>",
                                listing: parentList,
                                onConfirm: function (params) {

                                    $.post($APP.UI.EditableLists.currentItemInfo.url, $APP.UI.EditableLists.currentItemInfo.parentForm.serialize(), function (data) {

                                        //prevent row display if user has no delete rights
                                        var errorSummaryObjectRef = $(data).find(".validation_error_summary")
                                        var validationInputRef = $(data).find('input')

                                        var isSecurityError = false, isValidationError =false, validationMsg="", securityErrorMsg = "";
                                        var validationErrorMsgRef, validationErrorMsgObjRef


                                        if ($(errorSummaryObjectRef).find(".html_dialog_content p").html() != null && validationInputRef != null) {
                                            isSecurityError = ($(errorSummaryObjectRef).find(".html_dialog_content p").html().toString().indexOf('security') > -1) ? true : false;
                                            isValidationError = ($(errorSummaryObjectRef).find(".html_dialog_content p").html().toString() != "") ? true : false;
                                            securityErrorMsg = $(errorSummaryObjectRef).find(".html_dialog_content p").html();
                                            validationMsg = $(errorSummaryObjectRef).find(".html_dialog_content p").html().toString();

                                            validationErrorMsgObjRef = ($(validationInputRef).val().indexOf("Security") > 0) ? $(validationInputRef).val() : null

                                            if (validationErrorMsgObjRef != null) {
                                                validationErrorMsgRef = validationErrorMsgObjRef.split("[:::]")
                                                validationErrorMsg = validationErrorMsgRef[2]
                                            }
                                        }

                                        if (isSecurityError) {
                                            var confirmDialog = $APP.UI.Confirm({
                                                id: "security_message",
                                                message: "<strong>" + securityErrorMsg.toString().replace(":", ".") +'<br><br>'+validationErrorMsg+ "</strong>",
                                                showNoButton: false,
                                                yesLabel: 'Continue'
                                            });
                                            confirmDialog.show();
                                            $APP.UI.EditableLists.currentItemInfo.showRow.find('.inline_button_loading').removeClass('inline_button_loading').addClass('inline_button_delete');
                                        }
                                        else if (isValidationError) {
                                            var confirmDialog = $APP.UI.Confirm({
                                                id: "security_message",
                                                message: "<strong>" +validationMsg+ "</strong>",
                                                showNoButton: false,
                                                yesLabel: 'Continue'
                                            });
                                            confirmDialog.show();
                                            $APP.UI.EditableLists.currentItemInfo.showRow.find('.inline_button_loading').removeClass('inline_button_loading').addClass('inline_button_delete');
                                        }
                                        else {
                                            $APP.UI.EditableLists.currentItemInfo.showRow.find('.inline_button_delete').removeClass('inline_button_delete').addClass('inline_button_loading');

                                            var returnedRow = $(data);
                                            var listUIObject = $APP.UI.EditableLists.findParent($APP.UI.EditableLists.currentItemInfo.showRow);

                                            if (returnedRow.hasClass('show_entity')) {
                                                // error occure while deleting the row: redisplay form with error
                                                location.reload();
                                                eval(deleteCallbackFunction);

                                            }
                                            else { //a string message was returned
                                                $($APP.UI.EditableLists.currentItemInfo.showRow).remove();
                                                $($APP.UI.EditableLists.currentItemInfo.editRow).remove();
                                                eval($APP.UI.EditableLists.currentItemInfo.parentList.data('callback'));
                                                eval(deleteCallbackFunction);

                                            }

                                            if ($('.with_inline', window.parent.document).length) {
                                                window.parent.$('.with_inline :input').attr('disabled', false);
                                                $('.with_inline', window.parent.document).css({ "opacity": "1" });

                                                //give user an option to undo inline list (only if it uses a temp table)
                                                if ($('.with_temp_inline', window.parent.document).length)
                                                    window.parent.$('#undo_changes').show();
                                            }
                                    }
                                    });
                                },
                                onCancel: function (params) {
                                    $APP.UI.EditableLists.currentItemInfo.showRow.css('background-color', 'white');
                                    $APP.UI.EditableLists.currentItemInfo.showRow.find('.inline_button_loading').removeClass('inline_button_loading').addClass('inline_button_delete');
                                }
                            });
                        });
                    }
                });
                $APP.log('$APP.UI.EditableList.registerDeleteButtons() complete');
            },

            registerInlineTabOrder: function (line) {
                var elements = $(line).find('input:not(.element_data), select');
                $(elements[2]).focus();
                $(elements[elements.length - 1]).bind('blur', function (event) {
                    $(elements[0]).focus();
                });
            },

            registerMemoLinks: function () {
                var moreLinks = $('.more_link');
                moreLinks.each(function (i, obj) {
                    $(obj).bind('click', function (event) {
                        event.preventDefault();
                        var parent = $(this).parent().get(0);
                        $(parent).html($(this).data('memo'));
                    });
                });
                $APP.log('$APP.UI.EditableList.registerMemoLinks() complete, ' + moreLinks.length + ' links registered');
            },

            removeAddFormRow: function () {
                $(this.htmlRef).find('.add_entity').remove();
            },

            removeEditFormRow: function (editFormRow) {
                editFormRow.remove();
            },

            removePrevListContent: function () {
                var listUIRef = this;

                $(listUIRef.htmlRef).find('.show_entity').each(function (index) {
                    $(this).remove();
                });
            },
            removeShowRow: function (showRow) {
                showRow.remove();
            },

            setURLs: function () {
                // check to see that we have a valid reference
                if (this.htmlRef === {}) {
                    alert('A valid list reference was not supplied!');
                    return false;
                }
                // make sure a URL was supplied for this listing.
                this.listURL = $(this.htmlRef).data('url');
                if (this.listURL == undefined) {
                    alert('The URL for this list was not supplied!');
                    $(this.htmlRef).css('border', '1px solid red');
                    return false;
                }
                // resolve a liveURL if one is present
                this.listURL = $APP.resolveLiveURL(this.htmlRef);
                if (this.listUrl == false) {
                    return false;
                }
                return true;
                $APP.log('$APP.UI.EditableList.setURLs() complete');
            },

            showAddLinkRow: function () {
                $(this.htmlRef).find('.add_entity_link').show();
            },

            removeAllErrors: function () {
                var ErrorSummaryUIRef = $APP.Errors.Summaries.find(this.errorSummaryID);

                if (ErrorSummaryUIRef != false && this.Error != undefined) {
                    for (var i = this.Error.length - 1; i >= 0; i--) {
                        $('#error_message_' + i).remove();
                        this.errors.splice(i, 1);
                    }
                }
            },

            showErrorSummary: function (message) {
                if (this.errorSummaryRef != false && message.length > 0) {
                    this.errorSummaryRef.find('.html_label_surface').html(message);
                    this.errorSummaryRef.show();
                }
            },

            showButtonLoadingAnimation: function (rowType, buttonType) {
                var rowClass, buttonClass;
                switch (rowType) {
                    case 'add_row':
                        rowClass = 'add_entity';
                        break;
                    case 'add_link_row':
                        rowClass = 'add_entity_link';
                        break;
                    case 'edit_row':
                        rowClass = 'edit_entity';
                        break;
                    case 'show_row':
                        rowClass = 'show_entity';
                        break;
                }
                switch (buttonType) {
                    case 'add_button':
                        buttonClass = 'inline_button_add';
                        break;
                    case 'edit_button':
                        buttonClass = 'inline_button_edit';
                        break;
                    case 'save_button':
                        buttonClass = 'inline_button_save';
                        break;
                    case 'delete_button':
                        buttonClass = 'inline_button_delete';
                        break;
                }
                $(this.htmlRef).find('.' + rowClass).find('.' + buttonClass).removeClass(buttonClass).addClass('inline_button_loading');
            }
        }
        return _editableList;
    } ());

    // Singleton constructor function
    $APP.UI.Lightbox = (function () {
        var _lightbox = function () { };
        _lightbox.prototype = {
            hide: function () {
                $('.lightbox').hide();
                $APP.log('$APP.UI.Lightbox.hide() complete');
            },
            show: function () {
                var lightbox = $('.lightbox');
                if (lightbox.length == 0) {
                    html = "<div class='lightbox'></div>";
                    lightbox = $(html);
                    lightbox.css("display", 'none');
                    lightbox.css("width", $(window).width());
                    lightbox.css("height", $(document).height());
                    $('body').append(lightbox);
                    $(window).bind('resize', function (event) {
                        lightbox = $('.lightbox');
                        if (lightbox.length > 0) {
                            lightbox.css('width', $(window).width());
                            lightbox.css('height', $(document).height());
                        }
                    });
                }
                lightbox.show();
                $APP.log('$APP.UI.Lightbox.show() complete');
            }
        }
        return new _lightbox
    } ());


    // Registration helper
    $APP.UI.MainMenu = (function () {
        var _mainMenu = function () {
            this.register = function () {
                $('#menu').bind('click', function (event) {
                    if ($('#menu_navigation').css('display') == 'none') {
                        $('#menu_navigation').show();
                    } else {
                        $('#menu_navigation').hide();
                    }
                });
                $('#menu_navigation ul li.item').bind('click', function (event) {
                    if ($(this).find('h4 a').length > 0) {
                        if (this.id == 'about_link') {
                            event.preventDefault();
                            $('#menu_navigation').hide();
                            if ($('#about_dialog').length > 0) {
                                ui.showLightbox();
                                $('#about_dialog').show();
                            } else {
                                $.get(root + 'Home/About', function (data) {
                                    ui.showDialog({
                                        id: 'about_dialog',
                                        title: 'About CARE',
                                        titleColor: 'blue',
                                        width: '50%',
                                        lightbox: true,
                                        iconURL: assets.images + 'icons/opnbr_16.png',
                                        content: data,
                                        shadow: true
                                    });
                                    $('#about_dialog #about_dialog_close_button').bind('click', function () {
                                        $('#about_dialog').hide();
                                        ui.hideLightbox();
                                    });
                                });
                            }
                        } else {
                            event.preventDefault();
                            window.location = $(this).find('h4 a').attr('href');
                        }
                        return false;
                    }
                    if (event.target.tagName.toLowerCase() != 'a') {
                        if ($(this).hasClass('selected')) {
                            $(this).find('ul').hide();
                            $(this).removeClass('selected');
                        } else {
                            $(this).parent().find('li.item').each(function (idx, obj) {
                                $(obj).removeClass('selected');
                                $(obj).find('ul').hide();
                            });
                            $(this).addClass('selected');
                            $(this).find('ul').show();
                        }
                    }
                });
            };
        };
        return new _mainMenu;
    } ());


    // Registration Helper
    $APP.UI.NavigationRollups = (function () {

        var _navigationRollups = [];
        _navigationRollups.register = function (scope) {

            // accepts scope as a parameter so the applied functionality can be sand-boxed.
            if (!scope) scope = $(document);

            // register behavioral functions for navigation-rollup widget components
            $(scope).find('.navigation_rollup .show_all').bind('click', function (event) {
                event.preventDefault();
                var rollup = $(this).parent().children(".rollup");
                if (rollup.css("display") == "none") {
                    rollup.show();
                }
            });

            $(scope).find('.navigation_rollup ul.bar li a, .navigation_rollup ul.rollup li a').bind('focus', function (event) {
                if (!$(this).hasClass("current")) {
                    $(this).css("background-color", "silver");
                    $(this).css("color", "black");
                }
            });

            $(scope).find('.navigation_rollup ul.bar li a, .navigation_rollup ul.rollup li a').bind('blur', function (event) {
                if (!$(this).hasClass("current")) {
                    $(this).css("background-color", "");
                    $(this).css("color", "white");
                }
            });

            $(scope).find("body").bind("click", function (event) {
                if (!$(event.target).parent().hasClass("show_all")) { $(".navigation_rollup .rollup").hide(); }
            });
        };
        return _navigationRollups;
    } ());


    // Registration Helper
    $APP.UI.RegisterExpandableDialogs = function (scope) {
        scope = $(scope) || $(document);
        scope.find('.html_expandable_dialog').each(function (i, obj) {
            var dialogRef = obj;
            $(dialogRef).find('.panel').bind('click', function (event) {
                var panel = $(this);
                var content = $(dialogRef).find('.content');
                var panel_divider = $(dialogRef).find('.html_dialog_divider');
                if (!content || !panel) {
                    alert('There is no ".content" or ".panel" DIV defined for this expandable dialog!');
                    return false;
                } else {
                    if (content.css('display') == 'none') {
                        content.show();
                        panel.addClass('selected_panel');
                        if (panel_divider) panel_divider.show();
                    } else {
                        content.hide();
                        panel.removeClass('selected_panel');
                        if (panel_divider) panel_divider.hide();
                    }
                }
            });
        });
    };


    // Registration Helper
    $APP.UI.RegisterLabelCloseButtons = function (scope) {
        scope = $(scope) || $(document);
        scope.find('.html_label').each(function (i, obj) {
            var labelRef = obj;
            $(labelRef).find('.close_icon').bind('click', function (event) {
                $(labelRef).remove();
            });
        });
    };

    //Register Helper
    $APP.UI.SubformNavigationBtns = function () {

        $(".html_panel_slide_toggle_content").find(".html_panel_content_left_arrow").each(function (i, obj) {

            $(this).unbind("click");
            var imgSrc = $(this).find("img").attr("src");
            var url = $(this).attr("href")

            //create arrow enable/disable effect when hovering over
            $(this).hover(function () {
                $(this).find("img").attr("src", imgSrc.replace("left_arrow_bw_24", "left_arrow_24"));
            }, function () {
                $(this).find("img").attr("src", imgSrc);
            });

            //update the form when clicked on left arrow
            $(this).bind("click", function (event) {
                event.preventDefault();
                var url = $(this).attr("href")
                var prevFormRef = $('#main_content').find('#form_content')

                $(prevFormRef).find("form").attr("action", url)
                $(prevFormRef).find("form").submit();
            });

        });

        $(".html_panel_slide_toggle_content").find(".html_panel_content_right_arrow").each(function (i, obj) {

            $(this).unbind("click");
            var imgSrc = $(this).find("img").attr("src");

            //create arrow enable/disable effect when hovering over
            $(this).hover(function () {
                $(this).find("img").attr("src", imgSrc.replace("right_arrow_bw_24", "right_arrow_24"));
            }, function () {
                $(this).find("img").attr("src", imgSrc);
            });

            //update the form when clicked on right arrow
            $(this).bind("click", function (event) {
                event.preventDefault();
                var url = $(this).attr("href")
                var prevFormRef = $('#main_content').find('#form_content')

                $(prevFormRef).find("form").attr("action", url)
                $(prevFormRef).find("form").submit();
            });

        });

    };

    // Registration Helper
    $APP.UI.SubformNavigation = (function () {

        var _subformNavigationWidgets = [];
        _subformNavigationWidgets.register = function (scope) {

            // accepts scope as a parameter so the applied functionality can be sand-boxed.
            if (!scope) scope = $(document);

            // register behavioral functions for navigation-rollup widget components
            $(scope).find('.subform_navigation .show_all').bind('click', function (event) {
                event.preventDefault();

                var dropDown = $(this).parent().find(".dropdown");

                if (dropDown.is(':visible')) {
                    $('.subform_navigation .dropdown').fadeOut(150);

                } else {
                    var dropDown = $(this).parent().find(".dropdown");
                    if (dropDown.css("display") == "none") {
                        $('.subform_navigation .dropdown').fadeOut(150);
                        dropDown.show();
                    }
                }
            });

            $(scope).find('.subform_navigation ul.dropdown li a').bind('focus', function (event) {
                if (!$(this).hasClass("current")) {
                    $(this).css("background-color", "silver");
                    $(this).css("color", "black");
                }
            });

            $(scope).find('.subform_navigation ul.dropdown li a').bind('blur', function (event) {
                if (!$(this).hasClass("current")) {
                    $(this).css("background-color", "");
                    $(this).css("color", "white");
                }
            });

            $(scope).find("body").bind("click", function (event) {
                if (!$(event.target).parent().hasClass("show_all")) { $(".subform_navigation .dropdown").fadeOut(150); }
            });
        };
        return _subformNavigationWidgets;
    } ());
}











var ui = {
    showConfirm: function (options) {

        /*
        Required Options:
		
        - id: string
        the ID to be assigned to the confirmation dialog.
		  
        - message: string
        the message to be shown to the user
		
        Optional Parameters:
		
        - yesIcon: string / URL of icon image
        the icon to be used for the 'yes' button.  a default icon will be used if one is not specified.
		  
        - noIcon: string / URL of icon image
        the icon to be used for the 'no' button.  a default icon will be used if one is not specified.
		  
        - onConfirm: function
        while not required, the confirmation dialog will be pretty useless without it.  the passed function will be called when the user clicks 'yes'
		  
        - onCancel: function
        by default the confirmation will be closed if a function is not passed.  otherwise, this will be called.
        */

        var dialog = $('#' + options.id);

        if (dialog.length == 0) {
            dialog = $(html);

            ui.registerButtonHovers(dialog);
            ui.registerCloseButtons(dialog);
            ui.registerCancelButtons(dialog);
            ui.registerNavigationRollups(dialog);

            dialog.find('#' + options.id + '_yes').bind('click', function (event) {
                if (options.onConfirm) options.onConfirm();
                if (options.lightbox) ui.hideLightbox();
                dialog.hide();
            });

            dialog.find('#' + options.id + '_no').bind('click', function (event) {
                if (options.onCancel) options.onCancel();
                if (options.lightbox) ui.hideLightbox();
                dialog.hide();
            });
        }

        dialog.css("z-index", "9999");
        dialog.css("display", "none");

        if (options.lightbox) this.showLightbox();
        dialog.css("position", "absolute");
        $('body').append(dialog);

        var position = {
            left: ($(window).width() / 2) - (dialog.width() / 2),
            top: ($(window).height() / 2) - (dialog.height() / 2)
        };

        this.setPosition(dialog, position);

        dialog.show();
        dialog.find('#' + options.id + '_no input').focus();
    }
};






