const GOGGLES_SERVER = 'https://secure.toolness.com/webxray/';

const widgets = require("widget");
const tabs = require("tabs");

var widget = widgets.Widget({
  id: "hackasaurus-screenshot-link",
  label: "Share on Hackasaurus",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    var tab = tabs.activeTab;
    var dataURI = tab.getThumbnail();
    var title = tab.title;
    var url = tab.url;
    var favicon = tab.favicon;
    // TODO: Send this somewhere!
  }
});

var widget = widgets.Widget({
  id: "hackasaurus-activate-goggles",
  label: "Activate Goggles",
  contentURL: "http://www.flickr.com/favicon.ico",
  onClick: function() {
    var tab = tabs.activeTab;
    var worker = tabs.activeTab.attach({
      contentScript: getGogglesBookmarkletCode(GOGGLES_SERVER)
    });
  }
});

// This was mostly copied from:
// https://github.com/hackasaurus/webxray/blob/master/static-files/bookmarklet.js
function getGogglesBookmarkletCode(baseURI) {
  var baseCode = '(function(){"use strict";var base="http://localhost:8000/";var link=document.createElement("link");link.setAttribute("rel", "stylesheet");link.setAttribute("href",base+"webxray.css");document.documentElement.appendChild(link);var script=document.createElement("script");script.src=base+"webxray.js";script.className="webxray";document.documentElement.appendChild(script);})();';

  baseURI = baseURI || document.baseURI;
  return baseCode.replace('http://localhost:8000/', baseURI);
}
