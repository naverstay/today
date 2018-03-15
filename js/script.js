var $wnd, $body, $header, $footer,
    $subscribeTrigger, $subscribeBlock, $goTop, $goTopHolder, didScroll,
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

    $body
        .delegate('.subscribeForm', 'submit', function (e) {
            var form = $(this);
            e.preventDefault();

            if (form.validationEngine('validate')) {
                // todo remove

                if (form.find('input').first().val().length > 1) {
                    $('.subscribeBlock').addClass('subscribe_success');
                } else {
                    $('.subscribeBlock').addClass('subscribe_fail');
                }
            }
        })
        .delegate('.actionBtn', 'click', function () {
            var parent = $(this).closest('.articleActionBlock');
            $('.articleActionBlock').not(parent).removeClass('_opened').closest('.article_block').removeClass('_active');
            parent.toggleClass('_opened').closest('.article_block').toggleClass('_active');
            return false;
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
                //offset_top: (stck.attr('data-sticky-offset') || 0) * 1,
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

    initSubscribePopup();

    initValidation();

    initMask();

});

$(window)
    .on('load', function () {
        checkHeader();
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

function initSubscribePopup() {
    $('.openSubscribe').popup({
        backOpacity: 0.6,
        content: $('#popup_subscribe'),
        afterOpen: function (e) {
            initValidation('.validatePopup', 1);
        }
    });
}

function initMask() {
  $("input").filter(function (i, el) {
    return $(el).attr('data-inputmask') !== void 0;
  }).inputmask();
}

function initValidation(el, prompts) {
    $(el || '.validateMe').each(function (ind) {
        var f = $(this);

        f.validationEngine({
            //binded: true,
            scroll: false,
            showPrompts: !!prompts,
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
