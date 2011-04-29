const { Cc, Ci, Cu, Cr } = require("chrome");

var ioSvc = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService);

var dirsvc = Cc["@mozilla.org/file/directory_service;1"]
             .getService(Ci.nsIProperties);

// Remove all script tags in the given document and
// all iframes within it.
function removeScripts(document) {
  function killScripts(document) {
    var scripts = document.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      script.parentNode.removeChild(script);
    }
  }

  killScripts(document);
  
  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var contentDocument = iframe.contentDocument;
    if (contentDocument)
      killScripts(contentDocument);
  }
}

function MozFile(path) {
  var file = Cc['@mozilla.org/file/local;1']
             .createInstance(Ci.nsILocalFile);
  file.initWithPath(path);
  return file;
}

function makeWebBrowserPersist()
{
  const persistContractID = "@mozilla.org/embedding/browser/nsWebBrowserPersist;1";
  const persistIID = Ci.nsIWebBrowserPersist;
  return Cc[persistContractID].createInstance(persistIID);
}

function internalSave(options) {
  var file = options.file;
  var persist = makeWebBrowserPersist();
  const nsIWBP = Ci.nsIWebBrowserPersist;
  const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
                nsIWBP.PERSIST_FLAGS_FORCE_ALLOW_COOKIES |
                nsIWBP.PERSIST_FLAGS_BYPASS_CACHE |
                nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
  
  persist.progressListener = {
    QueryInterface: function(iid) {
      if (iid.equals(Ci.nsIWebProgressListener) ||
          iid.equals(Ci.nsISupports)) {
          return this;
      }
      throw Cr.NS_ERROR_NO_INTERFACE;
    },
    onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
      if (aStateFlags & Ci.nsIWebProgressListener.STATE_IS_NETWORK &&
          aStateFlags & Ci.nsIWebProgressListener.STATE_STOP) {
        options.success();
      }
    },
    onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress,
                               aMaxSelfProgress, aCurTotalProgress,
                               aMaxTotalProgress) {
    },
    onLocationChange: function() {
    },
    onStatusChange: function() {
    },
    onSecurityChange: function() {
    }
  };
  
  var encodingFlags = nsIWBP.ENCODE_FLAGS_ENCODE_BASIC_ENTITIES;  
  const kWrapColumn = 80;
  
  persist.saveDocument(options.document,
                       ioSvc.newFileURI(file),
                       options.fileFolder,
                       "text/html",
                       encodingFlags,
                       kWrapColumn);
}

exports.saveCurrentPage = function saveCurrentPage() {
  var activeTab = require('tab-browser').activeTab;
  var window = activeTab.ownerDocument.defaultView;
  var browser = window.gBrowser.getBrowserForTab(activeTab);

  removeScripts(browser.contentDocument);

  internalSave({
    file: MozFile("/tmp/download.html"),
    fileFolder: MozFile("/tmp/download_files"),
    document: browser.contentDocument,
    success: function() {
      console.log("Done!");
    }
  });
}
