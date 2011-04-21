var escapeHTML = require('escape-html').escapeHTML;

exports.testEscapeHTMLWorks = function(test) {
  var str = '<div class="article">This is an article</div>';
  test.assertEqual(escapeHTML(str),
                   '&lt;div class="article"&gt;This is an article' +
                   '&lt;/div&gt;');
}
