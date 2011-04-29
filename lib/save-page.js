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

var dirsvc = Cc["@mozilla.org/file/directory_service;1"]
             .getService(Ci.nsIProperties);

function MozFile(path) {
  var file = Cc['@mozilla.org/file/local;1']
             .createInstance(Ci.nsILocalFile);
  file.initWithPath(path);
  return file;
}

function saveCurrentPage() {
  var activeTab = require('tab-browser').activeTab;
  var window = activeTab.ownerDocument.defaultView;
  var browser = window.gBrowser.getBrowserForTab(activeTab);

  removeScripts(browser.contentDocument);

  window.internalSave(
    browser.currentURI, // aURL,
    browser.contentDocument, // aDocument,
    null, // aDefaultFileName,
    "attachment; filename=index.html", // aContentDisposition,
    "text/html", // aContentType,
    false, // aShouldBypassCache,
    null, // aFilePickerTitleKey,
    new window.AutoChosen(
      MozFile("/tmp/download.html"),
      browser.currentURI
      ), // aChosenData,
    null, // aReferrer,
    true, // aSkipPrompt,
    undefined // aCacheKey
  );
}
