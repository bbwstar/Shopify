(function($) {  

  $(document).ready(function() {
    initWishlist();
    initProductWishlist();
    initRemoveWishlist();
  }); 

  function initWishlist() {
    $('.add-to-wishlist').click(function(e) {
      e.preventDefault();
      var form = $(this).parent();  
      var productItem = $(this).parents('.product-container');
      console.log( productItem );
      $.ajax({
        type: 'POST',
        url: '/contact',
        data: form.serialize(),
        beforeSend: function() {
          form.html('<div class="loader"><svg xml:space="preserve" style="enable-background:new 0 0 50 50;" viewBox="0 0 24 30" height="20px" width="21px" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1"><rect opacity="0.2" fill="#333" height="8" width="3" y="10" x="0"><animate repeatCount="indefinite" dur="0.6s" begin="0s" values="0.2; 1; .2" attributeType="XML" attributeName="opacity"/><animate repeatCount="indefinite" dur="0.6s" begin="0s" values="10; 20; 10" attributeType="XML" attributeName="height"/><animate repeatCount="indefinite" dur="0.6s" begin="0s" values="10; 5; 10" attributeType="XML" attributeName="y"/></rect><rect opacity="0.2" fill="#333" height="8" width="3" y="10" x="8">      <animate repeatCount="indefinite" dur="0.6s" begin="0.15s" values="0.2; 1; .2" attributeType="XML" attributeName="opacity"/><animate repeatCount="indefinite" dur="0.6s" begin="0.15s" values="10; 20; 10" attributeType="XML" attributeName="height"/><animate repeatCount="indefinite" dur="0.6s" begin="0.15s" values="10; 5; 10" attributeType="XML" attributeName="y"/></rect><rect opacity="0.2" fill="#333" height="8" width="3" y="10" x="16"><animate repeatCount="indefinite" dur="0.6s" begin="0.3s" values="0.2; 1; .2" attributeType="XML" attributeName="opacity"/><animate repeatCount="indefinite" dur="0.6s" begin="0.3s" values="10; 20; 10" attributeType="XML" attributeName="height"/><animate repeatCount="indefinite" dur="0.6s" begin="0.3s" values="10; 5; 10" attributeType="XML" attributeName="y"/></rect></svg></div>');
        },
        success: function(data) { 
          form.html('<a class="btn wishlist btn-default added" href="/pages/wish-list" title="Go to wishlist"><i class="fa fa-check"></i></a>');
          var title = $(productItem).find('.product-name').html();
          var image = $(productItem).find('.product-featured-image').attr('src');  
          $('.product-popup').removeClass('cart-popup').addClass('wishlist-popup');
          $('.product-popup .overlay').removeClass('no-background');
          $('.product-popup').find('.product-name').html(title);
          $('.product-popup').find('.product-image img').attr('src', image);    
          showPopup('.product-popup');
        },
        error: function(xhr, text) { 
          form.html('<a class="btn btn-default wishlist added" href="/pages/wish-list" title="Go to wishlist"><i class="fa fa-check"></i></a>');   
          $('.error-message').text($.parseJSON(xhr.responseText).description);
          showPopup('.error-popup');
        }
      });
    });

  }window.initWishlist=initWishlist;


  function initProductWishlist() {
    $('.product-single .add-to-wishlist').click(function(e) {
      e.preventDefault();
     
      var form = $(this).parent();
      $.ajax({
        type: 'POST',
        url: '/contact', 
        data: form.serialize(),
        beforeSend: function() {
          showPopup('.loading'); 
        },
        success: function(data) {
          hidePopup('.loading');  
          form.html('<a class="wishlist added" href="/pages/wish-list" title="Go to wishlist"><i class="icon-heart"></i></a>');            
          var title = $('.product-name').html();
          var image = $('.product-featured-image').attr('src');
          $('.product-popup').find('.product-name').html(title);
          $('.product-popup').find('.product-image img').attr('src', image);
          $('.product-popup').find('.btn-wishlist').show();
          $('.product-popup').find('.btn-cart').hide();
          showPopup('.product-popup');


        },
        error: function(xhr, text) {
          hidePopup('.loading');    
          $('.error-message').text($.parseJSON(xhr.responseText).description);
          showPopup('.error-popup');  
        }
      });

    }); 
  };

  /* Remove Wishlist */
  function initRemoveWishlist() {
    $('.btn-remove-wishlist').click(function(e) {
      e.preventDefault();
      var row = $(this).parents('tr');
      var tagID = row.find('.tag-id').val();
      var form = jQuery('#remove-wishlist-form');
      form.find("input[name='contact[tags]']").val('x' + tagID);
      $.ajax({
        type: 'POST',
        url: '/contact',
        data: form.serialize(),
        beforeSend: function() {
          showPopup('.loading'); 

        },
        success: function(data) {
          row.fadeOut(1000);
          hidePopup('.loading');  
        },
        error: function(xhr, text) {
          $('.error-message').text($.parseJSON(xhr.responseText).description);
          showPopup('.error-popup');
        }
      });
    });
  };


})(jQuery);