var tabs = require('tabs'),
    data = require('self').data;

function createTabTest(testFunc) {
  return function(test) {
    var tab = tabs.open({
      url: data.url('test/index.html'),
      onReady: function(tab) {
        tab.activate();
        testFunc(test, function done() {
          tab.close();
          test.done();
        }, tab);
      }
    });
    test.waitUntilDone();
  }
}

exports.testGetCanvas = createTabTest(function(test, done) {
  var canvas = require('tab-screenshot').getCanvas();
  test.assertEqual(canvas.toString(), '[object HTMLCanvasElement]');
  done();
});

exports.testSavePage = createTabTest(function(test, done) {
  var formData = [];
  var paths = ["index.html", "files", "files/test_image.png"];
  require('save-page').saveCurrentPage(formData, function(dir) {
    test.assert(dir.exists(), "root save dir must exist");
    paths.forEach(function(path) {
      var parts = path.split('/');
      var file = dir.clone();
      parts.forEach(function(part) { file.append(part); });
      test.assert(file.exists(), path + ' must exist');
    });
    dir.remove(true);

    var formKeys = [];
    formData.forEach(function(tuple) { formKeys.push(tuple[0]); });
    test.assertEqual(JSON.stringify(formKeys),
                     JSON.stringify(["index_support_files",
                                     "index_file",
                                     "index_support_file_0",
                                     "index_support_file_0_dir"]),
                     "form data contains expected keys");

    done();
  });
});
