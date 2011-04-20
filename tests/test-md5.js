var MD5 = require('md5');

exports.testMD5Works = function(test) {
  MD5.test();
  test.pass("MD5 self-test works.");
};
