var MD5 = require('md5');

exports.loadConfig = function() {
  return JSON.parse(require('self').data.load('flickr-config.json'));
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
