window.$ = window.jQuery = require('../../vendor/jquery/dist/jquery.min.js');
window.Tether = require('../../vendor/tether/dist/js/tether.min.js');
require('../../vendor/bootstrap/dist/js/bootstrap.min.js');

const fse = require('fs-extra');
const ipcRenderer = require('electron').ipcRenderer;
const _ = require('lodash');
const moment = require('moment');
const Q = require('q');
const cryptojs = require('crypto-js');

const KEY = '9nRmaSi7mFVH4IB4XRxi';

var getUrlVars = function () {
  var vars = [],
    hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
};

$(function () {
  $('.dropdown-toggle').dropdown();
})
