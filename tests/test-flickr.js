var flickr = require('flickr');

// This just tests the example provided in section 3 of the Desktop
// Applications How-To in the Flickr Authentication API docs:
//
// http://www.flickr.com/services/api/auth.howto.desktop.html

exports.testSigningWorks = function(test) {
  var sig = flickr.sign('000005fab4534d05', {
    method: 'flickr.auth.getFrob',
    api_key: '9a0554259914a86fb9e7eb014e4e5d52'
  });
  test.assertEqual(sig, '8ad70cd3888ce493c8dde4931f7d6bd0');
};

exports.testphotoIDtoShortURLWorks = function(test) {
  test.assertEqual(flickr.photoIDtoShortURL(4379822687),
                   'http://flic.kr/p/7F2JGg');
};

exports.testGetPhotoIDReturnsNull = function(test) {
  test.assert(flickr.getPhotoID('aweg') === null);
};

exports.testGetPhotoIDReturnsNumber = function(test) {
  var text = '<rsp stat="ok">\n' +
             '<photoid>5639624646</photoid>' +
             '</rsp>';
  var id = flickr.getPhotoID(text);
  test.assertEqual(typeof(id), 'number');
  test.assertEqual(id, '5639624646');
};

exports.testLoadConfigWorks = function(test) {
  var cfg = flickr.loadConfig();
  ['api_key', 'secret', 'auth_token'].forEach(function(name) {
    test.assert(name in cfg, 'flickr-config.json should contain ' + name);
    test.assertEqual(typeof(cfg[name]), 'string',
                     name + ' should be a string.');
  });
};
