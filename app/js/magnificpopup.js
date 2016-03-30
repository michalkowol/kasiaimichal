import $ from 'jquery';
import 'magnific-popup';

const MagnificPopup = (function () {
  const self = {};

  function initGallery() {
    const magnificPopupGallery = {
      type: 'image',
      closeBtnInside: false,
      fixedContentPos: 'auto',
      fixedBgPos: true,
      navigateByImgClick: true,
      gallery: {
        enabled: true
      }
    };
    $('.gallery-item').magnificPopup(magnificPopupGallery);
  }

  self.init = function () {
    initGallery();
  };

  return self;
})();

export default MagnificPopup;