var MD5 = require('md5');

const PHOTO_REGEXP = /photoid>(\d+)<\/photoid/;

exports.photoIDtoShortURL = function(id) {
  function intval (mixed_var, base) {
      // http://kevin.vanzonneveld.net
      // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: stensi
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   input by: Matteo
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // *     example 1: intval('Kevin van Zonneveld');
      // *     returns 1: 0
      // *     example 2: intval(4.2);
      // *     returns 2: 4
      // *     example 3: intval(42, 8);
      // *     returns 3: 42
      // *     example 4: intval('09');
      // *     returns 4: 9
      // *     example 5: intval('1e', 16);
      // *     returns 5: 30

      var tmp;

      var type = typeof( mixed_var );

      if (type === 'boolean') {
          return (mixed_var) ? 1 : 0;
      } else if (type === 'string') {
          tmp = parseInt(mixed_var, base || 10);
          return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp;
      } else if (type === 'number' && isFinite(mixed_var) ) {
          return Math.floor(mixed_var);
      } else {
          return 0;
      }
  }

  function base_encode(num, alphabet) {
  	// http://tylersticka.com/
  	// Based on the Flickr PHP snippet:
  	// http://www.flickr.com/groups/api/discuss/72157616713786392/
  	alphabet = alphabet || '123456789abcdefghijkmnopqrstuvwxyz' +
  	                       'ABCDEFGHJKLMNPQRSTUVWXYZ';
  	var base_count = alphabet.length;
  	var encoded = '';
  	while (num >= base_count) {
  		var div = num/base_count;
  		var mod = (num-(base_count*intval(div)));
  		encoded = alphabet.charAt(mod) + encoded;
  		num = intval(div);
  	}
  	if (num) encoded = alphabet.charAt(num) + encoded;
  	return encoded;
  }

  return 'http://flic.kr/p/' + base_encode(id);
};

exports.loadConfig = function() {
  return JSON.parse(require('self').data.load('flickr-config.json'));
};

exports.getPhotoID = function(text) {
  var match = text.match(PHOTO_REGEXP);
  if (!match)
    return null;
  return parseInt(match[1]);
};

exports.sign = function(secret, args) {
  var parts = [secret];
  var argNames = [];
  for (var name in args)
    argNames.push(name);
  argNames.sort();
  argNames.forEach(function(name) {
    parts.push(name);
    parts.push(args[name]);
  });
  return MD5.hex(parts.join(''));
};
