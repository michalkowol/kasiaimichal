import $ from 'jquery';

const Navbar = (function () {
  const self = {};

  function closeOnClick() {
    $(".navbar-collapse").collapse('hide');
  }

  self.init = function () {
    $('.navbar-collapse a').click(closeOnClick);
  };

  return self;
})();


export default Navbar;