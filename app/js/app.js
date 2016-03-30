import React from 'react';
import ReactDOM from 'react-dom';
import Navbar from 'navbar';
import GiftsComponent from 'gifts.react'

window.$ = window.jQuery = require('jquery');
require('bootstrap');

ReactDOM.render(<GiftsComponent />, document.getElementById('gifts-table'));

$(function () {
  Navbar.init();
});