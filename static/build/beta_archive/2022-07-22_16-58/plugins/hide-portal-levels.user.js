// ==UserScript==
// @author         johnd0e
// @name           IITC plugin: Hide portal levels
// @category       Layer
// @version        0.1.0.20220722.165827
// @description    Replace all levels with single layerChooser's entry; reverting on longclick
// @id             hide-portal-levels
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://iitc.app/build/beta/plugins/hide-portal-levels.meta.js
// @downloadURL    https://iitc.app/build/beta/plugins/hide-portal-levels.user.js
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'beta';
plugin_info.dateTimeVersion = '2022-07-22-165827';
plugin_info.pluginId = 'hide-portal-levels';
//END PLUGIN AUTHORS NOTE


// use own namespace for plugin
var hideLevels = {};
window.plugin.hideLevels = hideLevels;

hideLevels.initCollapsed = true;

function setup () {
  var ctrl = window.layerChooser;

  hideLevels.portals = L.layerGroup();

  var levels = ctrl._layers.filter(function (data) {
    return data.overlay && data.name.endsWith(' Portals');
  });
  hideLevels.collapse = function (set) {
    var allDisabled = true;
    levels.forEach(function (data) {
      allDisabled = allDisabled && !data.layer._map;
      ctrl.removeLayer(data.layer, {keepOnMap: true});
      hideLevels.portals.addLayer(data.layer);
    });
    ctrl.addOverlay(hideLevels.portals, 'Portals', L.extend({
      sortPriority: -1000,
    }, set && {
      enable: !allDisabled
    }));

    var onMap = window.map.hasLayer(hideLevels.portals);
    levels.forEach(function (data) {
      if (onMap) {
        data.layer.addTo(window.map);
      } else {
        data.layer.remove();
      }
    });
  };

  hideLevels.expand = function () {
    var enable = !!hideLevels.portals._map;
    levels.forEach(function (data) {
      ctrl.addOverlay(data.layer, data.name, {enable: enable});
    });
    hideLevels.portals._layers = {};
    ctrl.removeLayer(hideLevels.portals);
  };

  levels.forEach(function (data) {
    data.layer.on('longclick', function (e) { // collapse
      e.preventDefault();
      hideLevels.collapse('set');
    });
  });

  hideLevels.portals.on('longclick', function (e) { // expand
    e.preventDefault();
    hideLevels.expand();
  });

  if (hideLevels.initCollapsed) {
    hideLevels.collapse();
  }
}

/* exported setup */

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

