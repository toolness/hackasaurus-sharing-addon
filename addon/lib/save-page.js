const { Cc, Ci, Cu, Cr } = require("chrome");

var jsm = {};
Cu.import("resource://gre/modules/FileUtils.jsm", jsm);

var ioSvc = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService);

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
                nsIWBP.PERSIST_FLAGS_FROM_CACHE |
                nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
  
  persist.persistFlags = flags;
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
        try {
          options.success();
        } catch (e) {
          console.exception(e);
        }
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

function makeUniqueTempDir(prefix) {
  var file;
  var i = 0;
  do {
    file = jsm.FileUtils.getFile("TmpD", [prefix + i]);
    i++;
  } while (file.exists());
  file.create(Ci.nsIFile.DIRECTORY_TYPE, 0777);
  return file;
}

exports.saveCurrentPage = function saveCurrentPage(formData, cb) {
  var activeTab = require('tab-browser').activeTab;
  var window = activeTab.ownerDocument.defaultView;
  var browser = window.gBrowser.getBrowserForTab(activeTab);

  require('save-page-fixups').applyAllFixups(browser.contentDocument);

  var url = browser.currentURI.path;
  var dir = makeUniqueTempDir("page-");
  
  var file = dir.clone();
  var fileFolder = dir.clone();
  
  file.append('index.html');
  fileFolder.append('files');

  internalSave({
    file: file,
    fileFolder: fileFolder,
    document: browser.contentDocument,
    success: function() {
      var files = [file.path];
      var fnames = ['index_file']
      var fdirs = {};
      var addedFileCount = 0;

      function recurse(fileFolder, dirname) {
        require('file').list(fileFolder.path).forEach(function(name) {
          var f = fileFolder.clone();
          f.append(name);
          if (f.isDirectory()) {
            recurse(f, dirname + '/' + name);
          } else {
            files.push(f.path);
            fnames.push('index_support_file_' + addedFileCount);
            fdirs[addedFileCount] = dirname;
            addedFileCount++;
          }
        });
      }

      if (fileFolder.exists())
        recurse(fileFolder, 'files');

      // This is a super crazy hack to convert a nsILocalFile
      // to a nsIDOMFile. Eventually we'll be able to just
      // use the File constructor to do the same thing, once
      // Firefox 5/6 are released.
      const XHTML_NS = "http://www.w3.org/1999/xhtml";
      var elem = window.document.createElementNS(XHTML_NS, "input");
      elem.setAttribute("type", "file");
      elem.setAttribute("multiple", "");
      window.gBrowser.appendChild(elem);
      elem.mozSetFileNameArray(files, files.length);

      formData.push(['index_support_files', addedFileCount]);

      for (var i = 0; i < elem.files.length; i++) {
        formData.push([fnames[i], elem.files[i]]);
        var j = i-1;
        if (j in fdirs) {
          formData.push([fnames[i] + '_dir', fdirs[j]]);
        }
      }
      elem.parentNode.removeChild(elem);

      cb(dir);
    }
  });
};
