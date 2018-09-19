var $wnd, $body, $header, $footer,
    $subscribeTrigger, $subscribeBlock, $goTop, $goTopHolder, didScroll, tagSlider,
    $followPopup, $compilationPopup, $hotEmailPopup, $contestFbPopup,
    $bonusPopup, $sharePopup, $subscribePopup, followCountDown,
    lastScrollTop = 0, delta = 5,
    subscribe_spacer = 270;

$(function ($) {
    $wnd = $(window);
    $body = $('body').removeClass('no_transition');
    $header = $('.header');
    $footer = $('.footer');
    $goTopHolder = $('.goTopHolder');
    $goTop = $('.goTop');
    $subscribeBlock = $('.subscribeBlock');
    $subscribeTrigger = $('#subscribeTrigger');

    $(document).on('click', function (e) {
        if ($(e.target).closest('.articleActionBlock').length !== 1) {
            $('.articleActionBlock').removeClass('_opened').closest('.article_block').removeClass('_active');
        }
    });

    fitSameHeight();
    
    $body
        .delegate('.subscribeForm', 'submit', function (e) {
            var form = $(this);
            e.preventDefault();

            if (form.validationEngine('validate')) {
                // todo remove

                if (form.find('input').first().val().length > 1) {
                    form.addClass('subscribe_success');
                } else {
                    form.addClass('subscribe_fail');
                }
            }
        })
        .delegate('.actionBtn', 'click', function () {
            var parent = $(this).closest('.articleActionBlock');
            $('.articleActionBlock').not(parent).removeClass('_opened').closest('.article_block').removeClass('_active');
            parent.toggleClass('_opened').closest('.article_block').toggleClass('_active');
            return false;
        })
        .delegate('.pollBtn', 'click', function () {
            $(this).closest('.pollBlock').addClass('_show_vote');
            return false;
        })
        .delegate('.manualLink', 'click', function () {
            $(this).parent().toggleClass('_opened');
        })
        .delegate('select', 'change', function () {
            this.blur();
        })
        .delegate('.statLink', 'click', function () {
            var btn = $(this);
            btn.parent().addClass('_active').siblings().removeClass('_active');
            $('.statList').attr('data-stat', btn.attr('data-stat'));
            return false;
        })
        .delegate('.subscribeLink', 'click', function () {
            $('.subscribeBlock').addClass('open_subscribe');
            return false;
        })
        .delegate('.forceValidation', 'keyup', function () {
            var inp = $(this);

            if (inp.val().length) {
                inp.closest('form').validationEngine('validate');
            }
        })
        .delegate('.subscribeClose', 'click', function () {
            if ($body.hasClass('_show_subscribe')) {
                $body.removeClass('_show_subscribe').addClass('_no_subscribe');
            } else {
                var block = $('.subscribeBlock');

                block.removeClass('subscribe_success').removeClass('subscribe_fail');

                if (block.hasClass('open_subscribe')) {
                    block.removeClass('open_subscribe');
                } else {

                }
            }

            return false;
        })
        .delegate('.goTop', 'click', function () {
            docScrollTo(0, 600);
            return false;
        })
        .delegate('.subscribeAsideBtn', 'click', function () {
            var btn = $(this);

            $body.toggleClass('subscribe_opened');

            setTimeout(function () {
                btn.parent().find('.subscribeBlock').removeClass('subscribe_success').removeClass('subscribe_fail');
            }, 300);

            return false;
        })
        .delegate('.searchBtn', 'click', function () {
            $body.removeClass('menu_opened').toggleClass('search_opened');
            return false;
        })
        .delegate('.menuBtn', 'click', function () {
            $body.removeClass('search_opened').toggleClass('menu_opened');
            return false;
        });

    $('.fixMe')
        .on('sticky_kit:stick', function (e) {

        })
        .on('sticky_kit:unstick', function (e) {

        })
        .on('sticky_kit:bottom', function (e) {
            $(this).addClass('_bottom');
        })
        .on('sticky_kit:unbottom', function (e) {
            $(this).removeClass('_bottom');
        })
        .each(function (ind) {
            var stck = $(this);

            stck.stick_in_parent({
                offset_top: (stck.attr('data-sticky-offset') || 0) * 1,
                sticky_class: stck.attr('data-sticky-class') || ''
            });
        });

    $('.completeIt').each(function (ind) {
        var inp = this, ajax = new XMLHttpRequest(), url = $(inp).attr('data-url');
        ajax.open("GET", url, true);

        ajax.onload = function () {
            var list = JSON.parse(ajax.responseText).map(function (i) {
                return {name: i.name, date: i.date};
            });

            new autoComplete({
                selector: inp,
                menuClass: 'autocomplete_v1',
                minChars: 1,
                source: function (term, suggest) {
                    term = term.toLowerCase();
                    var choices = list;
                    var suggestions = [];
                    for (i = 0; i < choices.length; i++)
                        if (~(choices[i].name).toLowerCase().indexOf(term)) suggestions.push(choices[i]);
                    suggest(suggestions);
                },
                renderItem: function (item, search) {
                    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    return '<div class="autocomplete-suggestion" ' +
                        'data-name="' + item.name + '" ' +
                        'data-val="' + search + '">' +
                        //'<div class="search_date">' + item.date + '' + '</div>' +
                        '<div class="search_result">' + item.name + '</div>' +
                        '</div>';
                },
                onSelect: function (e, term, item) {
                    console.log('Item "' + ' (' + item.getAttribute('data-name') + ')" selected by ' + (e.type === 'keydown' ? 'pressing enter' : 'mouse click') + '.');

                    inp.value = item.getAttribute('data-name');

                }
            });
        };

        ajax.send();
    });

    initValidation();

    initMask();

    fixOLincrement();

    //initTagSlider();
});

$(window)
    .on('load', function () {
        checkHeader();

        initSubscribePopup();

        initFollowPopup();

        initSharePopup();

        initBonusPopup();

        initCompilationPopup();

        initHotEmailBtn();

        initContestFbPopup();
        
    })
    .on('scroll', function () {
        var scrtop = getScrollTop(),
            wnd_h = $wnd.height(),
            subscr_h = $subscribeBlock.outerHeight(),
            footer_top = $footer.offset().top;

        didScroll = true;

        checkHeader();

        if ($goTopHolder.length) {
            $goTopHolder.toggleClass('_vis', scrtop >= ($wnd.height() * 2)).toggleClass('_bottom', (scrtop + wnd_h - subscribe_spacer) >= (footer_top));
        }

        if ($header.length) {
            $header.toggleClass('_shadow', scrtop >= 10);
        }

        if ($subscribeTrigger.length && !$body.hasClass('_no_subscribe')) {
            //console.log(subscr_h, scrtop - wnd_h, $subscribeTrigger.offset().top, scrtop + wnd_h, footer_top);

            $body.toggleClass('_show_subscribe', ((scrtop + wnd_h) > ($subscribeTrigger.offset().top + subscr_h)) && ((scrtop + wnd_h) < (footer_top + subscr_h)));
        }
    });

function getScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function docScrollTo(pos, speed, callback) {
    $('html,body').animate({'scrollTop': pos}, speed, function () {
        if (typeof(callback) == 'function') {
            callback();
        }
    });
}

function fitSameHeight() {
    $('.sameHeight').each(function (ind) {
        var row = $(this).attr('data-row');

        setSameHeight('.sameHeight[data-row=' + row + ']');
    });
}

function setSameHeight(item, $item_count) {
    var maxHeight = 0, blocks = $(item);
    if ($item_count === void 0) {
        $item_count = blocks.length;
    }
    
    blocks.css('height', 'auto');
    
    for (var i = 0; i < blocks.length; i++) {
        maxHeight = blocks.eq(i).height() > maxHeight ? blocks.eq(i).height() : maxHeight;

        if ((i + 1) % $item_count === 0) {
            for (var j = i - $item_count + 1; j < i + 1; j++) {
                blocks.eq(j).height(maxHeight);
            }
            maxHeight = 0;
        }
    }
    
    //if (i % blocks.length) {
    //    for (var jj = i - $item_count; jj < i; jj++) {
    //        blocks.height(maxHeight);
    //    }
    //}
}

function checkHeader() {
    // Hide Header on scroll down
    var nb = $('.header');
    var st = getScrollTop();
    var navbarHeight = nb.outerHeight();

    // setInterval(function () {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }

    // }, 250);

    function hasScrolled() {
        // Make sure they scroll more than delta
        if (Math.abs(lastScrollTop - st) <= delta) return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight) {
            // Scroll Down
            nb.removeClass('nav-down').addClass('nav-up');
        } else {
            // Scroll Up
            if (st + $(window).height() < $(document).height()) {
                nb.removeClass('nav-up').addClass('nav-down');
            }
        }

        lastScrollTop = st;
    }
}

function fixOLincrement() {
    $('ol[start]').each(function () {
        var ol = $(this);
        ol.css('counter-reset', 'ordered_list ' + ol.attr('start'));
    });
}

function initSharePopup() {

    $sharePopup = $('#sh_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v2 dialog_title_v2',
        //appendTo: '.wrapper',
        width: 500,
        draggable: true,
        title: " ",
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });
}


function initSubscribePopup() {

    $subscribePopup = $('#subscribe_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v2 dialog_title_v2',
        //appendTo: '.wrapper',
        width: 500,
        draggable: true,
        title: " ",
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });

    $('.openSubscribe').on('click', function () {
        $subscribePopup.dialog('open');
        return false;
    });
}

/*function initSubscribePopup() {
    $('.openSubscribe').popup({
        backOpacity: 0.6,
        content: $('#popup_subscribe'),
        afterOpen: function (e) {
            initValidation('.validatePopup', 1);
        }
    });
}*/

function initFollowPopup() {

    $followPopup = $('#follow_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v1',
        //appendTo: '.wrapper',
        width: 788,
        draggable: true,
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');

            startFollowCountDown();
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });
}

function initBonusPopup() {

    $bonusPopup = $('#bonus_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v2 dialog_title_v1',
        //appendTo: '.wrapper',
        width: 600,
        draggable: true,
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });

    $('body').delegate('.contestBtnTw', 'click', function () {
        $bonusPopup.dialog('open');
        return false;
    });

}

function initCompilationPopup() {

    $compilationPopup = $('#compilation_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v2 dialog_title_v1',
        //appendTo: '.wrapper',
        width: 500,
        draggable: true,
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });

    $('body').delegate('.compilationBtn', 'click', function () {
        $compilationPopup.dialog('open');
        return false;
    });
}

function initHotEmailBtn() {

    $hotEmailPopup = $('#hotmail_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v2 dialog_title_v1',
        //appendTo: '.wrapper',
        width: 500,
        draggable: true,
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });

    $('body').delegate('.hotEmailBtn', 'click', function () {
        $hotEmailPopup.dialog('open');
        return false;
    });
}

function initContestFbPopup() {

    $contestFbPopup = $('#contest_fb_popup').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        closeText: '',
        dialogClass: 'dialog_v2 dialog_title_v1',
        //appendTo: '.wrapper',
        width: 600,
        draggable: true,
        collision: "fit",
        position: {my: "top center", at: "top center", of: window},
        open: function (event, ui) {
            $body.addClass('modal_opened overlay_v2');
        },
        close: function (event, ui) {
            $body.removeClass('modal_opened overlay_v2');
        }
    });

    $('body').delegate('.contestBtnFb', 'click', function () {
        $contestFbPopup.dialog('open');
        return false;
    });
}

function startFollowCountDown() {
    var time = 20;

    followCountDown = setInterval(function () {
        time--;

        $('.followCounter').text(plural(time, 'second', 'seconds', 'seconds'));

        if (!time) {
            clearInterval(followCountDown);
            $followPopup.dialog('close');
        }
    }, 1000);
}

function initTagSlider() {
    tagSlider = new Swiper('.swiper-container', {
        setWrapperSize: false,
        slidesPerView: 'auto',
        spaceBetween: 0,
        freeMode: true,
        watchOverflow: true,
        roundLengths: true,
        navigation: {
            nextEl: '.tagNext',
            prevEl: '.tagPrev'
        }
    });

    $('body')
        .delegate('.tagNext', 'mouseenter', function () {
            if (!isTouch()) tagSlider.slideNext();
        })
        .delegate('.tagPrev', 'mouseenter', function () {
            if (!isTouch()) tagSlider.slidePrev();
        });
}

function plural(n, str1, str2, str5) {
    return n + ' ' + ((((n % 10) == 1) && ((n % 100) != 11)) ? (str1) : (((((n % 10) >= 2) && ((n % 10) <= 4)) && (((n % 100) < 10) || ((n % 100) >= 20))) ? (str2) : (str5)))
}

function isTouch() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}

function initMask() {
    $("input").filter(function (i, el) {
        return $(el).attr('data-inputmask') !== void 0;
    }).inputmask();
}

function initValidation(el, prompts) {
    $(el || '.validateMe').each(function (ind) {
        var f = $(this), prompt = f.attr('data-prompts');

        f.validationEngine({
            //binded: true,
            scroll: false,
            showPrompts: prompt !== void 0 ? prompt : !!prompts,
            showArrow: false,
            addSuccessCssClassToField: 'success',
            addFailureCssClassToField: 'error',
            parentFieldClass: '.formCell',
            parentFormClass: '.formParent',
            promptPosition: "centerRight",
            //doNotShowAllErrosOnSubmit: true,
            //focusFirstField          : false,
            autoHidePrompt: false,
            autoHideDelay: 3000,
            autoPositionUpdate: false,
            prettySelect: true,
            //useSuffix                : "_VE_field",
            addPromptClass: 'relative_mode one_msg',
            showOneMessage: false
        });
    });
}
