import $ from 'jquery';
import 'magnific-popup';

const MagnificPopup = (function () {
  const self = {};

  const magnificPopupCommons = {
    closeBtnInside: false,
    fixedContentPos: 'auto',
    fixedBgPos: true
  };

  function initFullPriceList() {
    const magnificPopupGallery = {
      type: 'inline',
      overflowY: 'auto',
      closeBtnInside: true
    };
    $('.btn-full-price').magnificPopup($.extend({}, magnificPopupCommons, magnificPopupGallery));
  }

  function initGallery() {
    const magnificPopupGallery = {
      type: 'image',
      navigateByImgClick: true,
      gallery: {
        enabled: true
      }
    };
    $('.gallery-item').magnificPopup($.extend({}, magnificPopupCommons, magnificPopupGallery));
  }

  self.init = function () {
    //initGallery();
    //initFullPriceList();
  };

  return self;
})();

export default MagnificPopup;