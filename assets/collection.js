(function($) {  

  $(document).ready(function() {
    collection.init();
  }); 

  if ($(".collection-sidebar")) {
    History.Adapter.bind(window, 'statechange', function() {
      var State = History.getState();
      if (!collection.fillterClick) {        
        collection.filterParams();
        var newurl = collection.filterCreateUrl();
        collection.filterGetContent(newurl);
        collection.resetFilter();
      }
      collection.fillterClick = false;
    });
  }


  var collection = { 
    init: function() {

      /* Collection Filter */
      this.initCollectionFilter();

      this.initCollectionSorting();
      this.initCollectionViewMode();
		this.initPaging();
    },


    /* --------------------------------------------------------- */
    /* Review */
    initReview: function() { 

        // return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();

    },

    /* Hide Dropdown */
    initToggle: function(){
     
    },

    /* --------------------------------------------------------- */
    /* Categories Fillter */

    filterCategories: function() {
      
    },

    fillterTagEvents: function() {
      
      $( "body" ).delegate( '.filter-tag a:not(".clear"), .filter-tag label', 'click',function(e) {           
        
        var currentTags = [];
        
        if (Shopify.queryParams.constraint) {
            currentTags = Shopify.queryParams.constraint.split('+');     
        }  

        if (!window.filter_mul_choice && !$(this).prev().is(":checked")) {  
            var otherTag = $(this).parents('.filter-tag').find("input:checked");
            if (otherTag.length > 0) {
                var tagName = otherTag.val();
                if (tagName) {
                  var tagPos = currentTags.indexOf(tagName);
                    if (tagPos >= 0) {           
                        currentTags.splice(tagPos, 1);
                    }
                }
            }          
        }

        var tagName = $(this).prev().val();
        if (tagName) {
            var tagPos = currentTags.indexOf(tagName);
            if (tagPos >= 0) {            
                currentTags.splice(tagPos, 1);
            } else {
                currentTags.push(tagName);
            }
        }
        if (currentTags.length) {
            Shopify.queryParams.constraint = currentTags.join('+');
        } else {
            delete Shopify.queryParams.constraint;
        }
        collection.filterAjaxClick();
        e.preventDefault();
      });
    },

    filterMapClearAll: function() {
      //clear all selection
        $("body").delegate( 'click','.refined-widgets a.clear-all', function(e) {
            delete Shopify.queryParams.constraint;
            delete Shopify.queryParams.q;
            collection.filterAjaxClick();
            e.preventDefault();
        });

         $("body").delegate( '.filter-block .clear', 'click', function(e) {   
              var currentTags = [];
              var filterTag = $(this).parent().parent();
              if (Shopify.queryParams.constraint) {
                  currentTags = Shopify.queryParams.constraint.split('+');
              }
              filterTag.find("input:checked").each(function() {
                  var selectedTag = $(this);
                  var tagName = selectedTag.val();
                  if (tagName) {
                    var tagPos = currentTags.indexOf(tagName);
                      if (tagPos >= 0) {
                        //remove tag
                          currentTags.splice(tagPos, 1);
                      }
                  }
              });
              if (currentTags.length) {
                  Shopify.queryParams.constraint = currentTags.join('+');
              } else {
                  delete Shopify.queryParams.constraint;
              }
              collection.filterAjaxClick();
              e.preventDefault();
          });

    },

    filterMapClear: function() { 
        $(".filter-tag").each(function() {
          var filterTag = $(this);
          if (filterTag.find("input:checked").length > 0) {
              //has active tag
              filterTag.find(".clear").show();
          }
        });        
    }, 

    filterParams: function() {
        Shopify.queryParams = {};
        if (location.search.length) {
            for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
                aKeyValue = aCouples[i].split('=');
                if (aKeyValue.length > 1) {
                    Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
                }
            }
        }
    },    

    filterMapEvents: function() {
        collection.fillterTagEvents();
    },

    resetFilter: function() {
        $(".filter-custom .active, .filter-links .active").removeClass("active");
        $(".filter-tag input:checked").attr("checked", false);

        //category
        var cat = location.pathname.match(/\/collections\/(.*)(\?)?/);
        if (cat && cat[1]) {
          $(".filter-links a[href='" + cat[0] + "']").addClass("active");
        }
    },

    filterMapData: function(data) {
 
        var currentList = $(".grid-uniform");
         

        var productList = $(data).find(".grid-uniform");
          
        currentList.replaceWith(productList);
		
      	//replace paging
        if ($(".padding").length > 0) {
          $(".padding").replaceWith($(data).find(".padding"));
        };

        $('.filter-block').replaceWith( $(data).find(".filter-block") );
        collection.filterMapClear();
    },

    filterCreateUrl: function(baseLink) {
      var newQuery = $.param(Shopify.queryParams).replace(/%2B/g, '+');
      if (baseLink) {

        if (newQuery != "")
          return baseLink + "?" + newQuery;
        else
          return baseLink;
      }
      return location.pathname + "?" + newQuery;
    },       

    filterAjaxClick: function(baseLink) {
      delete Shopify.queryParams.page;  
      var newurl = collection.filterCreateUrl(baseLink);
      collection.fillterClick = true;
      History.pushState({
        param: Shopify.queryParams  
      }, newurl, newurl);
      collection.filterGetContent(newurl);         
    },        

    filterGetContent: function(newurl) {

      $.ajax({
        type: 'get',
        url: newurl, 
        beforeSend: function() {    
          showPopup('.loading'); 
        },

        success: function(data) { 
 
          collection.filterMapData(data);               
           
          collection.filterMapClear();
          hidePopup('.loading'); 

        }, 

        error: function(xhr, text) {
          hidePopup('.loading')
          $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
          showPopup('.ajax-error-modal');
        }

      });
    },
    
    

    initCollectionFilter: function() {
      if ($(".collection-sidebar").length > 0) {
        collection.filterParams();
        collection.filterMapEvents();
        collection.filterMapClear();
        collection.filterMapClearAll();
      }
    },

    /* --------------------------------------------------------- */
    /* Collection Sorting */
    initCollectionSorting: function(e) {
     $("#SortBy").change(function(e) {
        e.preventDefault();     
          
          Shopify.queryParams.sort_by = $(this).val();
          collection.filterAjaxClick();          

            

      });
    },


    /* --------------------------------------------------------- */
    /* Collection View Mode */
    initCollectionViewMode: function() {
       $(".collection-view .change-view").click(function(e) {  
        e.preventDefault();
       
          var currentPage = $(this).attr('href'); 
          var view = $(this).data("view");       
          if (view == "list") {
            Shopify.queryParams.view = "list" + currentPage;
          } else {
            Shopify.queryParams.view = currentPage;
          }
          collection.filterAjaxClick();
          $(".collection-view .change-view").removeClass("change-view--active");
          $(this).addClass("change-view--active"); 
     
       
      });
    },


    /* --------------------------------------------------------- */
    /* Collection Show */
    initCollectionShow: function() {   
     
    },

    /* --------------------------------------------------------- */
    /* Paging */
    initPaging: function() {
      $(".pagination a").click(function(e) {
        var page = $(this).attr("href").match(/page=\d+/g); 
        if (page) {
          Shopify.queryParams.page = parseInt(page[0].match(/\d+/g));
          if (Shopify.queryParams.page) {
            var newurl = collection.filterCreateUrl();
            collection.fillterClick = true;
            History.pushState({
              param: Shopify.queryParams
            }, newurl, newurl);
            collection.filterGetContent(newurl);
            //go to top
            $('body,html').animate({
              scrollTop: 0
            }, 600);

          }
        }
        e.preventDefault();
      });
    }


  }

})(jQuery);