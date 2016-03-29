import director from 'director';
import Navbar from 'navbar';
import MagnificPopup from 'magnificpopup';

window.$ = window.jQuery = require('jquery');
require('bootstrap');

$(function () {
  Navbar.init();
  MagnificPopup.init();
});