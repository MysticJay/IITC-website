// ==UserScript==
// @author         jonatkins
// @name           IITC plugin: Blank map
// @category       Map Tiles
// @version        0.1.2.20210316.075211
// @description    Add a blank map layer - no roads or other features.
// @id             basemap-blank
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://iitc.modos189.ru/build/beta/plugins/basemap-blank.meta.js
// @downloadURL    https://iitc.modos189.ru/build/beta/plugins/basemap-blank.user.js
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'beta';
plugin_info.dateTimeVersion = '2021-03-16-075211';
plugin_info.pluginId = 'basemap-blank';
//END PLUGIN AUTHORS NOTE


// use own namespace for plugin
window.plugin.mapTileBlank = function() {};

window.plugin.mapTileBlank.addLayer = function() {

  var blankOpt = {attribution: '', maxNativeZoom: 18, maxZoom: 21};
  var blankWhite = new L.TileLayer('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEFCSU6z3A8pwAAAA1JREFUCNdj+P///38ACfsD/dGDjPAAAAAASUVORK5CYII=', blankOpt);
  var blankBlack = new L.TileLayer('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEFCQkJSZE2HwAAAAxJREFUCNdjYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==', blankOpt);

  layerChooser.addBaseLayer(blankWhite, "Blank Map (White)");
  layerChooser.addBaseLayer(blankBlack, "Blank Map (Black)");
};

var setup =  window.plugin.mapTileBlank.addLayer;

setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

