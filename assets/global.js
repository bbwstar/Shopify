/* Jonathan Snook - MIT License - https://github.com/snookca/prepareTransition */
(function(a){a.fn.prepareTransition=function(){return this.each(function(){var b=a(this);b.one("TransitionEnd webkitTransitionEnd transitionend oTransitionEnd",function(){b.removeClass("is-transitioning")});var c=["transition-duration","-moz-transition-duration","-webkit-transition-duration","-o-transition-duration"];var d=0;a.each(c,function(a,c){d=parseFloat(b.css(c))||d});if(d!=0){b.addClass("is-transitioning");b[0].offsetWidth}})}})(jQuery);

/* replaceUrlParam - http://stackoverflow.com/questions/7171099/how-to-replace-url-parameter-with-javascript-jquery */
function replaceUrlParam(e,r,a){var n=new RegExp("("+r+"=).*?(&|$)"),c=e;return c=e.search(n)>=0?e.replace(n,"$1"+a+"$2"):c+(c.indexOf("?")>0?"&":"?")+r+"="+a};

/*============================================================================
  Money Format
  - Shopify.format money is defined in option_selection.js.
    If that file is not included, it is redefined here.
==============================================================================*/
if ((typeof Shopify) === 'undefined') { Shopify = {}; }
if (!Shopify.formatMoney) {
  Shopify.formatMoney = function(cents, format) {
    var value = '',
    placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
    formatString = (format || this.money_format);

    if (typeof cents == 'string') {
      cents = cents.replace('.','');
    }

    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal   = defaultOption(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number/100.0).toFixed(precision);

      var parts   = number.split('.'),
          dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
          cents   = parts[1] ? (decimal + parts[1]) : '';

      return dollars + cents;
    }

    switch(formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  };
}

// 
Shopify.getProduct = function(handle, callback) {
  jQuery.getJSON('/products/' + handle + '.js', function (product, textStatus) {
    if ((typeof callback) === 'function') {
      callback(product);
    }
    else {
      Shopify.onProduct(product);
    }
  });
};

//
function qtyProduct() { 
    $('.qtyplus').click(function(e){  
      var fieldName = $(this).attr('data-field');
      var currentVal = parseInt($('input[name='+fieldName+']').val());

      if (!isNaN(currentVal)) {
        $('input[name='+fieldName+']').val(currentVal + 1);
      } else {
        $('input[name='+fieldName+']').val(1);
      }
      e.preventDefault();
    });

    $(".qtyminus").click(function(e) {

      var fieldName = $(this).attr('data-field');
      var currentVal = parseInt($('input[name='+fieldName+']').val());
      if (!isNaN(currentVal) && currentVal > 1) {
        $('input[name='+fieldName+']').val(currentVal - 1);    } 
      else {
        $('input[name='+fieldName+']').val(1);
      }
      e.preventDefault();
    });
  }window.qtyProduct=qtyProduct;
//
Shopify.resizeImage = function(image, size) {
  try {
    if(size == 'original') { return image; }
    else {      
      var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + '_' + size + '.' + matches[2];
    }    
  } catch (e) { return image; }
};

// Timber functions
window.timber = window.timber || {};

timber.cacheSelectors = function () {
  timber.cache = {
    // General
    $html                    : $('html'),
    $body                    : $('body'),

    // Navigation
    $navigation              : $('#AccessibleNav'),
    $mobileSubNavToggle      : $('.mobile-nav__toggle'),

    // Collection Pages
    $changeView              : $('.change-view'),

    // Product Page
    $productImage            : $('#ProductPhotoImg'),
    $thumbImages             : $('#ProductThumbs').find('a.product-single__thumbnail'),

    // Customer Pages
    $recoverPasswordLink     : $('#RecoverPassword'),
    $hideRecoverPasswordLink : $('#HideRecoverPasswordLink'),
    $recoverPasswordForm     : $('#RecoverPasswordForm'),
    $customerLoginForm       : $('#CustomerLoginForm'),
    $passwordResetSuccess    : $('#ResetSuccess')
  };
};

timber.init = function () {
  FastClick.attach(document.body);
  timber.cacheSelectors();
  timber.accessibleNav();
  timber.drawersInit();
  timber.mobileNavToggle();
  timber.productImageSwitch();
  timber.responsiveVideos();
  timber.collectionViews();
  timber.loginForms();
};

timber.accessibleNav = function () {
  var $nav = timber.cache.$navigation,
      $allLinks = $nav.find('a'),
      $topLevel = $nav.children('li').find('a'),
      $parents = $nav.find('.site-nav--has-dropdown'),
      $subMenuLinks = $nav.find('.site-nav__dropdown').find('a'),
      activeClass = 'nav-hover',
      focusClass = 'nav-focus';

  // Mouseenter
  $parents.on('mouseenter touchstart', function(evt) {
    var $el = $(this);

    if (!$el.hasClass(activeClass)) {
      evt.preventDefault();
    }

    showDropdown($el);
  });

  // Mouseout
  $parents.on('mouseleave', function() {
    hideDropdown($(this));
  });

  $subMenuLinks.on('touchstart', function(evt) {
    // Prevent touchstart on body from firing instead of link
    evt.stopImmediatePropagation();
  });

  $allLinks.focus(function() {
    handleFocus($(this));
  });

  $allLinks.blur(function() {
    removeFocus($topLevel);
  });

  // accessibleNav private methods
  function handleFocus ($el) {
    var $subMenu = $el.next('ul'),
        hasSubMenu = $subMenu.hasClass('sub-nav') ? true : false,
        isSubItem = $('.site-nav__dropdown').has($el).length,
        $newFocus = null;

    // Add focus class for top level items, or keep menu shown
    if (!isSubItem) {
      removeFocus($topLevel);
      addFocus($el);
    } else {
      $newFocus = $el.closest('.site-nav--has-dropdown').find('a');
      addFocus($newFocus);
    }
  }

  function showDropdown ($el) {
    $el.addClass(activeClass);

    setTimeout(function() {
      timber.cache.$body.on('touchstart', function() {
        hideDropdown($el);
      });
    }, 250);
  }

  function hideDropdown ($el) {
    $el.removeClass(activeClass);
    timber.cache.$body.off('touchstart');
  }

  function addFocus ($el) {
    $el.addClass(focusClass);
  }

  function removeFocus ($el) {
    $el.removeClass(focusClass);
  }
};

timber.drawersInit = function () {
  timber.LeftDrawer = new timber.Drawers('NavDrawer', 'left');
  timber.RightDrawer = new timber.Drawers('CartDrawer', 'right', {
    'onDrawerOpen': ajaxCart.load
  });
};

timber.mobileNavToggle = function () {
  timber.cache.$mobileSubNavToggle.on('click', function() {
    $(this).parent().toggleClass('mobile-nav--expanded');
  });
};

timber.getHash = function () {
  return window.location.hash;
};

timber.productPage = function (options) {
  var moneyFormat = options.money_format,
      variant = options.variant,
      selector = options.selector;

  // Selectors
  var $productImage = $('#ProductPhotoImg'),
      $addToCart = $('#AddToCart'),
      $productPrice = $('#ProductPrice'),
      $comparePrice = $('#ComparePrice'),
      $quantityElements = $('.quantity-selector, label + .js-qty'),
      $addToCartText = $('#AddToCartText');

  if (variant) {

    // Update variant image, if one is set
    if (variant.featured_image) {
      var newImg = variant.featured_image,
          el = $productImage[0];
      Shopify.Image.switchImage(newImg, el, timber.switchImage);
    }

    // Select a valid variant if available
    if (variant.available) {
      // Available, enable the submit button, change text, show quantity elements
      $addToCart.removeClass('disabled').prop('disabled', false);
      $addToCartText.html("Add to Cart");
      $quantityElements.show();
    } else {
      // Sold out, disable the submit button, change text, hide quantity elements
      $addToCart.addClass('disabled').prop('disabled', true);
      $addToCartText.html("Sold Out");
      $quantityElements.hide();
    }

    // Regardless of stock, update the product price
    $productPrice.html( Shopify.formatMoney(variant.price, moneyFormat) );

    // Also update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      $comparePrice
        .html("Compare at" + ' ' + Shopify.formatMoney(variant.compare_at_price, moneyFormat))
        .show();
    } else {
      $comparePrice.hide();
    }

  } else {
    // The variant doesn't exist, disable submit button.
    // This may be an error or notice that a specific variant is not available.
    // To only show available variants, implement linked product options:
    //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
    $addToCart.addClass('disabled').prop('disabled', true);
    $addToCartText.html("Unavailable");
    $quantityElements.hide();
  }
};

timber.productImageSwitch = function () {
  if (timber.cache.$thumbImages.length) {
    // Switch the main image with one of the thumbnails
    // Note: this does not change the variant selected, just the image
    timber.cache.$thumbImages.on('click', function(evt) {
      evt.preventDefault();
      var newImage = $(this).attr('href');
      timber.switchImage(newImage, null, timber.cache.$productImage);
    });
  }
};

timber.switchImage = function (src, imgObject, el) {
  // Make sure element is a jquery object
  var $el = $(el);
  $el.attr('src', src);
};

timber.responsiveVideos = function () {
  var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
  var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

  $iframeVideo.each(function () {
    // Add wrapper to make video responsive
    $(this).wrap('<div class="video-wrapper"></div>');
  });

  $iframeReset.each(function () {
    // Re-set the src attribute on each iframe after page load
    // for Chrome's "incorrect iFrame content on 'back'" bug.
    // https://code.google.com/p/chromium/issues/detail?id=395791
    // Need to specifically target video and admin bar
    this.src = this.src;
  });
};

timber.collectionViews = function () {
  if (timber.cache.$changeView.length) {
    timber.cache.$changeView.on('click', function() {
      var view = $(this).data('view'),
          url = document.URL,
          hasParams = url.indexOf('?') > -1;

      if (hasParams) {
        window.location = replaceUrlParam(url, 'view', view);
      } else {
        window.location = url + '?view=' + view;
      }
    });
  }
};

timber.loginForms = function() {
  function showRecoverPasswordForm() {
    timber.cache.$recoverPasswordForm.show();
    timber.cache.$customerLoginForm.hide();
  }

  function hideRecoverPasswordForm() {
    timber.cache.$recoverPasswordForm.hide();
    timber.cache.$customerLoginForm.show();
  }

  timber.cache.$recoverPasswordLink.on('click', function(evt) {
    evt.preventDefault();
    showRecoverPasswordForm();
  });

  timber.cache.$hideRecoverPasswordLink.on('click', function(evt) {
    evt.preventDefault();
    hideRecoverPasswordForm();
  });

  // Allow deep linking to recover password form
  if (timber.getHash() == '#recover') {
    showRecoverPasswordForm();
  }
};

timber.resetPasswordSuccess = function() {
  timber.cache.$passwordResetSuccess.show();
};

/*============================================================================
  Drawer modules
  - Docs http://shopify.github.io/Timber/#drawers
==============================================================================*/
timber.Drawers = (function () {
  var Drawer = function (id, position, options) {
    var defaults = {
      close: '.js-drawer-close',
      open: '.js-drawer-open-' + position,
      openClass: 'js-drawer-open',
      dirOpenClass: 'js-drawer-open-' + position
    };

    this.$nodes = {
      parent: $('body, html'),
      page: $('#PageContainer'),
      moved: $('.is-moved-by-drawer')
    };

    this.config = $.extend(defaults, options);
    this.position = position;

    this.$drawer = $('#' + id);

    if (!this.$drawer.length) {
      return false;
    }

    this.drawerIsOpen = false;
    this.init();
  };

  Drawer.prototype.init = function () {
    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$drawer.find(this.config.close).on('click', $.proxy(this.close, this));
  };

  Drawer.prototype.open = function (evt) {
    // Keep track if drawer was opened from a click, or called by another function
    var externalCall = false;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the drawer opens, the click event bubbles up to $nodes.page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }

    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.$nodes.moved.addClass('is-transitioning');
    this.$drawer.prepareTransition();

    this.$nodes.parent.addClass(this.config.openClass + ' ' + this.config.dirOpenClass);
    this.drawerIsOpen = true;

    // Set focus on drawer
    this.trapFocus(this.$drawer, 'drawer_focus');

    // Run function when draw opens if set
    if (this.config.onDrawerOpen && typeof(this.config.onDrawerOpen) == 'function') {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    // Lock scrolling on mobile
    this.$nodes.page.on('touchmove.drawer', function () {
      return false;
    });

    this.$nodes.page.on('click.drawer', $.proxy(function () {
      this.close();
      return false;
    }, this));
  };

  Drawer.prototype.close = function () {
    if (!this.drawerIsOpen) { // don't close a closed drawer
      return;
    }

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    // Ensure closing transition is applied to moved elements, like the nav
    this.$nodes.moved.prepareTransition({ disableExisting: true });
    this.$drawer.prepareTransition({ disableExisting: true });

    this.$nodes.parent.removeClass(this.config.dirOpenClass + ' ' + this.config.openClass);

    this.drawerIsOpen = false;

    // Remove focus on drawer
    this.removeTrapFocus(this.$drawer, 'drawer_focus');

    this.$nodes.page.off('.drawer');
  };

  Drawer.prototype.trapFocus = function ($container, eventNamespace) {
    var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

    $container.attr('tabindex', '-1');

    $container.focus();

    $(document).on(eventName, function (evt) {
      if ($container[0] !== evt.target && !$container.has(evt.target).length) {
        $container.focus();
      }
    });
  };

  Drawer.prototype.removeTrapFocus = function ($container, eventNamespace) {
    var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

    $container.removeAttr('tabindex');
    $(document).off(eventName);
  };

  return Drawer;
})();

// Initialize Timber's JS on docready
$(timber.init);

function showPopup(selector) {
  $(selector).addClass('active');
} window.showPopup=showPopup;

function hidePopup(selector) {
  $(selector).removeClass('active');
}

// apusthemes
(function ($) {
  jQuery(document).ready(function() {

      $(".owl-carousel[data-carousel=owl]").each( function(){
          var config = {
              loop: false,
              nav: $(this).data( 'nav' ),
              dots: $(this).data( 'pagination' ),
              items: 4,
              navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>']
          };
      
          var owl = $(this);
          if( $(this).data('items') ){
              config.items = $(this).data( 'items' );
          }

          if ($(this).data('large')) {
              var desktop = $(this).data('large');
          } else {
              var desktop = config.items;
          }
          if ($(this).data('medium')) {
              var medium = $(this).data('medium');
          } else {
              var medium = config.items;
          }
          if ($(this).data('smallmedium')) {
              var smallmedium = $(this).data('smallmedium');
          } else {
              var smallmedium = config.items;
          }
          if ($(this).data('extrasmall')) {
              var extrasmall = $(this).data('extrasmall');
          } else {
              var extrasmall = 2;
          }
          if ($(this).data('verysmall')) {
              var verysmall = $(this).data('verysmall');
          } else {
              var verysmall = 1;
          }
          config.responsive = {
              0:{
                  items:verysmall
              },
              320:{
                  items:extrasmall
              },
              768:{
                  items:smallmedium
              },
              980:{
                  items:medium
              },
              1280:{
                  items:desktop
              }
          }
          if( $(this).data('items') == "1" ){
          	config.responsive = {
                0:{
                    items:1
                },
                320:{
                    items:1
                },
                768:{
                    items:1
                },
                980:{
                    items:1
                },
                1280:{
                    items:1
                }
            }
          }
          if ($(this).data('animatein')) {
              config.animateIn = $(this).data('animatein');
          }
        	if ($(this).data('animateOut')) {
              config.animateOut = $(this).data('animateout');
          }
        	if ($(this).data('autoplay')) {
              config.autoplay = $(this).data('autoplay');
          }
        	if ($(this).data('autoplaytimeout')) {
              config.autoplayTimeout = $(this).data('autoplaytimeout');
          }

          $(this).owlCarousel( config );
          owl.on('changed.owl.carousel',function(property){
              var current = property.item.index;
              $('ul.slider-thumb li', owl.parent()).removeClass('active');
              $('ul.slider-thumb li', owl.parent()).eq(current).addClass('active');
          });

          $('ul.slider-thumb li', owl.parent()).on('click', function(){
              var index = $(this).index();
              owl.trigger('to.owl.carousel', [index, 0, true]);
              $('ul.slider-thumb li', owl.parent()).removeClass('active');
              $(this).addClass('active');
              return false; 
          });
      } );
      // Fix owl in bootstrap tabs
      $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
          var target = $(e.target).attr("href");
          var carousel = $(".owl-carousel[data-carousel=owl]", target).data('owlCarousel');
          if ( typeof carousel != 'undefined' ) {
            carousel._width = $(".owl-carousel[data-carousel=owl]", target).width();
            carousel.invalidate('width');
            carousel.refresh();
          }
      });

      // active first tab
      $('.nav-tabs').each(function(){
        $(this).find('li:first a').click();
      });

      // slider click
      $('.slider-owl .slider-content').click(function() {
        var href = $(this).data('link');
        if ( typeof href != 'undefined' && href != '' ) {
          window.location.href = href;
        }
      });

      // sticky header
      // /* automatic keep header always displaying on top */
      
        var _header_action = $('.main-sticky-header').offset().top;

        var ApusHeaderSticky = function() {
            "use strict";

            var main_sticky = $('.main-sticky-header');
            if ( $(document).scrollTop() > _header_action ) {
                main_sticky.addClass('sticky-header');
            } else {
                main_sticky.removeClass('sticky-header');
            }
        }
        
        $(window).scroll(function(event) {
            ApusHeaderSticky();
        });
      
    
    	// back to top
      var back_to_top = function () {
          jQuery(window).scroll(function () {
              if (jQuery(this).scrollTop() > 400) {
                  jQuery('#back-to-top1').addClass('active');
              } else {
                  jQuery('#back-to-top1').removeClass('active');
              }
          });
          jQuery('#back-to-top1').on('click', function () {
              jQuery('html, body').animate({scrollTop: '0px'}, 800);
              return false;
          });
      };
      back_to_top();
    	// init fancybox
    	$('.fancybox').fancybox();
    
    	//counter up
      if($('.counterUp').length > 0){
          $('.counterUp').counterUp({
              delay: 10,
              time: 800
          });
      }
    
    	
      /*---------------------------------------------- 
       *    Apply Filter        
       *----------------------------------------------*/
      jQuery('.collection_filter li a').on('click', function(){

          var parentul = jQuery(this).parents('ul.collection_filter').data('related-grid');
          jQuery(this).parents('ul.collection_filter').find('li').removeClass('active');
          jQuery(this).parent().addClass('active');
          var selector = jQuery(this).data('option-value');
        	jQuery('#'+parentul).find('.masonry-item').hide();
          jQuery('#'+parentul).find(selector).show();

          return(false);
      });
    	// preload page
      var $body = $('body')
      $body.addClass('apus-body-loading');

      setTimeout(function() {
        $body.removeClass('apus-body-loading');
        $('.apus-page-loading').fadeOut(250);
      }, 100);
    	// dropdown hover
    	$('.site-header .dropdown').hover(function() {
        $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(100);
      }, function() {
        $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(100);
      });

      // countdown timmer
      $('[data-countdown="countdown"]').each(function(index, el) {
          var $this = $(this);
          var $date = $this.data('datetime');
        	
          $this.apusCountDown({
            	TargetDate: $date,
                DisplayFormat:"<div class=\"countdown-wrapper\"><div class=\"day\"><span>%%D%%</span> D </div><div class=\"hours\"><span>%%H%%</span> H </div><div class=\"minutes\"><span>%%M%%</span> M </div><div class=\"seconds\"><span>%%S%%</span> S </div></div>",
                FinishMessage: ""
          });
      });

      // color
      $('body').on('mouseenter','.color-element', function(){
        var image = $(this).data('image');
        if ( image && typeof image != 'undefined' ) {
          $(this).parent().parent().find('.product-thumbnail img').attr('src', image);
        }
        return true;
      });
      // swatch
      initSwatch();
  });

})(jQuery)


function initSwatch() {$(".swatch :radio").change(function() {var t = $(this).closest(".swatch").attr("data-option-index");var n = $(this).val();$(this).closest("form").find(".single-option-selector").eq(t).val(n).trigger("change")});$(".hover-bimg").mouseenter(function() {$(this).closest('.product-image-container').find('.product_img_link').first().find('img').first().attr('src', $(this).data('bimg'));});$(".nav-verticalmenu .caret").click(function(e) {$(this).closest("li").toggleClass("menu-open");e.stopPropagation();});}
