// ==UserScript==
// @author         fkloft
// @name           IITC plugin: Layer count
// @category       Info
// @version        0.2.0.20210705.155404
// @description    Allow users to count nested fields
// @id             layer-count
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://iitc.app/build/beta/plugins/layer-count.meta.js
// @downloadURL    https://iitc.app/build/beta/plugins/layer-count.user.js
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'beta';
plugin_info.dateTimeVersion = '2021-07-05-155404';
plugin_info.pluginId = 'layer-count';
//END PLUGIN AUTHORS NOTE


// use own namespace for plugin
plugin.layerCount = {}

plugin.layerCount.onBtnClick = function(ev) {
	var btn = plugin.layerCount.button,
		tooltip = plugin.layerCount.tooltip,
		layer = plugin.layerCount.layer;

	if(btn.classList.contains("active")) {
		map.off("click", plugin.layerCount.calculate);
		btn.classList.remove("active");
	} else {
		map.on("click", plugin.layerCount.calculate);
		btn.classList.add("active");
		setTimeout(function(){
			tooltip.textContent = "Click on map";
		}, 10);
	}
};

plugin.layerCount.latLngE6ToGooglePoint = function(point) {
	return new google.maps.LatLng(point.latE6/1E6, point.lngE6/1E6);
}

/*
pnpoly Copyright (c) 1970-2003, Wm. Randolph Franklin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
     disclaimers.
  2. Redistributions in binary form must reproduce the above copyright notice in the documentation and/or other
     materials provided with the distribution.
  3. The name of W. Randolph Franklin may not be used to endorse or promote products derived from this Software without
     specific prior written permission.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
plugin.layerCount.pnpoly = function(latlngs, point) {
	var length = latlngs.length, c = false;

	for(var i = 0, j = length - 1; i < length; j = i++) {
		if(((latlngs[i].lat > point.lat) != (latlngs[j].lat > point.lat)) &&
		  (point.lng < latlngs[i].lng
		  + (latlngs[j].lng - latlngs[i].lng) * (point.lat - latlngs[i].lat)
		  / (latlngs[j].lat - latlngs[i].lat))) {
			c = !c;
		}
	}

	return c;
}

plugin.layerCount.calculate = function(ev) {
	var point = ev.latlng;
	var fields = window.fields;
	var layersRes = layersEnl = layersDrawn = 0;

	for(var guid in fields) {
		var field = fields[guid];

		// we don't need to check the field's bounds first. pnpoly is pretty simple math.
		// Checking the bounds is about 50 times slower than just using pnpoly
		if(plugin.layerCount.pnpoly(field.getLatLngs(), point)) {
			if(field.options.team == TEAM_ENL)
				layersEnl++;
			else if(field.options.team == TEAM_RES)
				layersRes++;
		}
	}

	if (window.plugin.drawTools) {
		for(var layerId in window.plugin.drawTools.drawnItems._layers) {
			var field = window.plugin.drawTools.drawnItems._layers[layerId];
			if(field instanceof L.GeodesicPolygon && plugin.layerCount.pnpoly(field.getLatLngs(), point)) 
				layersDrawn++;
		}
	}

	if(layersRes != 0 && layersEnl != 0)
		var content = "Res: " + layersRes + " + Enl: " + layersEnl + " = " + (layersRes + layersEnl) + " fields";
	else if(layersRes != 0)
		var content = "Res: " + layersRes + " field(s)";
	else if(layersEnl != 0)
		var content = "Enl: " + layersEnl + " field(s)";
	else
		var content = "No fields";

	if (layersDrawn != 0)
		content += "; draw: " + layersDrawn + " polygon(s)";

	plugin.layerCount.tooltip.innerHTML = content;

	return false;
};

var setup = function() {
	$('<style>').prop('type', 'text/css').html('\
.leaflet-control-layer-count a\
{\
	background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+Cgk8ZyBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eTowLjQ7c3Ryb2tlOm5vbmUiPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSw2IHoiLz4KCQk8cGF0aCBkPSJNIDYsMjQgMjQsMjQgMTUsMTIgeiIvPgoJCTxwYXRoIGQ9Ik0gNiwyNCAyNCwyNCAxNSwxOCB6Ii8+Cgk8L2c+Cjwvc3ZnPgo=");\
}\
.leaflet-control-layer-count a.active\
{\
	background-color: #BBB;\
}\
.leaflet-control-layer-count-tooltip\
{\
	background-color: rgba(255, 255, 255, 0.6);\
	display: none;\
	height: 24px;\
	left: 30px;\
	line-height: 24px;\
	margin-left: 15px;\
	margin-top: -12px;\
	padding: 0 10px;\
	position: absolute;\
	top: 50%;\
	white-space: nowrap;\
	width: auto;\
}\
.leaflet-control-layer-count a.active .leaflet-control-layer-count-tooltip\
{\
	display: block;\
}\
.leaflet-control-layer-count-tooltip:before\
{\
	border-color: transparent rgba(255, 255, 255, 0.6);\
	border-style: solid;\
	border-width: 12px 12px 12px 0;\
	content: "";\
	display: block;\
	height: 0;\
	left: -12px;\
	position: absolute;\
	width: 0;\
}\
').appendTo('head');

	var parent = $(".leaflet-top.leaflet-left", window.map.getContainer());

	var button = document.createElement("a");
	button.className = "leaflet-bar-part";
	button.addEventListener("click", plugin.layerCount.onBtnClick, false);
	button.title = 'Count nested fields';

	var tooltip = document.createElement("div");
	tooltip.className = "leaflet-control-layer-count-tooltip";
	button.appendChild(tooltip);

	var container = document.createElement("div");
	container.className = "leaflet-control-layer-count leaflet-bar leaflet-control";
	container.appendChild(button);
	parent.append(container);

	plugin.layerCount.button = button;
	plugin.layerCount.tooltip = tooltip;
	plugin.layerCount.container = container;
}

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

