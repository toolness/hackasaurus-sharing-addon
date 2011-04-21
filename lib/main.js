const GOGGLES_SERVER = 'https://secure.toolness.com/webxray/';
const UPLOAD_SERVER = 'https://secure.toolness.com/easy-flickr-upload/';

const widgets = require("widget");
const tabs = require("tabs");
const flickr = require("flickr");
const cfg = flickr.loadConfig();

var widget = widgets.Widget({
  id: "hackasaurus-screenshot-link",
  label: "Share Your Hack",
  contentURL: "http://www.flickr.com/favicon.ico",
  onClick: function() {
    var tab = tabs.activeTab;
    var dataURI = tab.getThumbnail();
    var title = tab.title;
    var url = tab.url;
    require('request').Request({
      url: UPLOAD_SERVER,
      content: {
        api_key: cfg.api_key,
        api_secret: cfg.secret,
        auth_token: cfg.auth_token,
        data_uri: dataURI
      },
      onComplete: function(response) {
        var id = flickr.getPhotoID(response.text);
        if (id !== null) {
          tabs.open(flickr.photoIDtoShortURL(id));
        } else {
          // TODO: Um, this is not very user-friendly.
          tabs.open("data:text/plain,Upload failed:\n" + response.text);
          console.error("Upload failed: " + response.text);
        }
      }
    }).post();
  }
});

var widget = widgets.Widget({
  id: "hackasaurus-activate-goggles",
  label: "Activate Hacker Goggles",
  contentURL: "http://www.mozilla.org/favicon.ico",
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
