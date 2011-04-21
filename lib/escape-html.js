// Taken from
// https://github.com/sstephenson/prototype/blob/master/src/prototype/lang/string.js

/** related to: String#unescapeHTML
* String#escapeHTML() -> String
*
* Converts HTML special characters to their entity equivalents.
*
* ##### Example
*
* '<div class="article">This is an article</div>'.escapeHTML();
* // -> "&lt;div class="article"&gt;This is an article&lt;/div&gt;"
**/
exports.escapeHTML = function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
