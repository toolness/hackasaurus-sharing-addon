// This file contains a number of workarounds for 
// Bug 115634: https://bugzilla.mozilla.org/show_bug.cgi?id=115634

function resolveURI(base, href) {
  return require('url').URL(href, base).toString();
}

// Remove all script tags in the given document and
// all iframes within it. This is largely a fix for
// Bug 115328: https://bugzilla.mozilla.org/show_bug.cgi?id=115328.

exports.removeScripts = function removeScripts(document) {
  var scripts = document.getElementsByTagName("script");
  var all = [];
  for (var i = 0; i < scripts.length; i++)
    all.push(scripts[i]);
  all.forEach(function(node) { node.parentNode.removeChild(node); });
}

// Remove all stylesheets and combine them into one. Largely a fix for
// Bug 115107: https://bugzilla.mozilla.org/show_bug.cgi?id=115107

exports.unifyCSS = function unifyCSS(document) {
  var rules = [];
  var ownerNodes = [];
  var url_re = /url\("(\S*)"\)/g;
  
  function outputRule(rule, baseURI) {
    switch (rule.type) {
      case rule.IMPORT_RULE:
      outputSheet(rule.styleSheet);
      break;

      default:
      var cssText = rule.cssText.replace(url_re, function(str, href) {
        // TODO: We're only absolut-ifying the URL here, which means
        // the style won't be fully locally hosted when saved.
        var resolved = resolveURI(baseURI, href);
        return "url(\"" + resolved + "\")";
      });
      rules.push(cssText);
    }
  }

  function outputSheet(sheet) {
    var baseURI = sheet.href || sheet.ownerNode.baseURI;
    rules.push('/* Begin stylesheet defined in ' + baseURI + ' */');
    if (sheet.ownerNode)
      ownerNodes.push(sheet.ownerNode);
    for (var i = 0; i < sheet.cssRules.length; i++)
      outputRule(sheet.cssRules[i], baseURI);
    rules.push('/* End stylesheet defined in ' + baseURI + ' */');
  }

  function main() {
    for (var i = 0; i < document.styleSheets.length; i++)
      outputSheet(document.styleSheets[i]);

    ownerNodes.forEach(function(node) {
      if (node.parentNode)
        node.parentNode.removeChild(node);
    });
  
    var style = document.createElement("style");
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
    
    return style;
  }
  
  return main();
}

exports.applyToDocument = function(document, fn) {
  fn(document);

  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var contentDocument = iframe.contentDocument;
    if (contentDocument)
      fn(contentDocument);
  }
}

exports.applyAllFixups = function(document) {
  exports.applyToDocument(document, exports.removeScripts);
  exports.applyToDocument(document, exports.unifyCSS);  
}
