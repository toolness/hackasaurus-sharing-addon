const GOGGLES_SERVER = 'https://secure.toolness.com/webxray/';
const UPLOAD_SERVER = 'https://secure.toolness.com/easy-flickr-upload/';

const widgets = require("widget");
const tabs = require("tabs");
const Panel = require("panel").Panel;
const data = require("self").data;
const flickr = require("flickr");
const cfg = flickr.loadConfig();

var panel = Panel({
  contentURL: data.url("upload.html"),
  contentScriptFile: data.url("upload-content-script.js"),
  contentScriptWhen: "start",
  width: 480,
  height: 500,
  onMessage: function(data) {
    if (data.event in panelHandlers) {
      panelHandlers[data.event](data.options);
    } else
      console.warn("no handler defined for " + data.event);
  }
});

var panelHandlers = {};

function sendPanelEvent(event, options) {
  panel.postMessage({event: event, options: options});
}

var widget = widgets.Widget({
  id: "hackasaurus-screenshot-link",
  label: "Share Your Hack",
  contentURL: "http://www.flickr.com/favicon.ico",
  panel: panel,
  onClick: function() {
    var tab = tabs.activeTab;
    var dataURI = tab.getThumbnail();
    var title = tab.title;
    var url = tab.url;

    sendPanelEvent("onShow", {
      url: dataURI
    });

    panelHandlers.onShareClicked = function(options) {
      delete panelHandlers.onShareClicked;
      var req = require('request').Request({
        url: UPLOAD_SERVER,
        content: {
          api_key: cfg.api_key,
          api_secret: cfg.secret,
          auth_token: cfg.auth_token,
          data_uri: dataURI,
          title: options.title,
          description: options.description,
          tags: 'hackasaurus hack'
        },
        onComplete: function(response) {
          var id = flickr.getPhotoID(response.text);
          if (id !== null) {
            sendPanelEvent("onUploadComplete", null);
            panel.hide();
            tabs.open(flickr.photoIDtoShortURL(id));
          } else {
            // TODO: Um, this is not very user-friendly.
            sendPanelEvent("onUploadFailed", {
              details: response.text
            });
            console.error("Upload failed: " + response.text);
          }
        }
      }).post();
    };
    
    panel.show();
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
