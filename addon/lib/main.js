const widgets = require("widget");
const tabs = require("tabs");
const Panel = require("panel").Panel;
const data = require("self").data;
const cfg = JSON.parse(data.load('config.json'));

var panel = Panel({
  contentURL: data.url("upload.html"),
  contentScript: "window.addonPort = self.port;",
  contentScriptWhen: "start",
  width: 480,
  height: 500
});

panel.port.on("shareClicked", function(options) {
  if (panel.onShareClicked)
    panel.onShareClicked(options);
  else
    console.log("panel.onShareClicked is not defined!");
});

var shareOnFlickrWidget = widgets.Widget({
  id: "hackasaurus-screenshot-link",
  label: "Share Your Hack on Flickr",
  contentURL: "http://www.flickr.com/favicon.ico",
  panel: panel,
  onClick: function() {
    var tab = tabs.activeTab;
    var screenshotCanvas = require('tab-screenshot').getCanvas();
    var file = screenshotCanvas.mozGetAsFile("screenshot.png", "image/png");
    var title = tab.title;
    var url = tab.url;

    panel.port.emit("show", {
      url: screenshotCanvas.toDataURL()
    });

    panel.onShareClicked = function(options) {
      panel.onShareClicked = null;
      var data = [
        ['auth_token', cfg.auth_token],
        ['source_title', title],
        ['source_url', url],
        ['description', options.description],
        ['title', options.title],
        ['screenshot', file]
      ];

      function upload(rootSaveDir) {
        require('upload-screenshot').upload({
          url: cfg.upload_server,
          data: data,
          callback: function(err, response) {
            if (rootSaveDir)
              rootSaveDir.remove(true);
            if (err === null) {
              panel.port.emit("uploadComplete", null);
              panel.hide();
              tabs.open(response.short_url);
            } else {
              panel.port.emit("onUploadFailed", {
                details: err
              });
              if (response && response.length)
                tabs.open('data:text/html,' + response);
              console.error("Upload failed: " + err);
            }
          }
        });
      }
      
      if ('replica' in options && options.replica == 'on')
        require('save-page').saveCurrentPage(data, upload);
      else
        upload(null);
    };
    
    panel.show();
  }
});

var activateGogglesWidget = widgets.Widget({
  id: "hackasaurus-activate-goggles",
  label: "Activate Hacker Goggles",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    var tab = tabs.activeTab;
    var worker = tabs.activeTab.attach({
      contentScript: getGogglesBookmarkletCode(cfg.goggles_server)
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
