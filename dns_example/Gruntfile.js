module.exports = function(grunt) {

  var rebuildNativeModules = function() {
    var done = this.async();
    var electronRebuild = require('electron-rebuild');
    var prebuiltPath = './node_modules/electron-prebuilt/';
    var electronVersion = require(prebuiltPath + 'package.json').version;

    electronRebuild.shouldRebuildNativeModules(prebuiltPath + '/dist/electron').then(function(shouldBuild) {
      if (!shouldBuild) {
        done();
      }
      console.log("Downloading electron headers for compilation");
      electronRebuild.installNodeHeaders(electronVersion).then(function() {
        console.log("Building native modules..");
        electronRebuild.rebuildNativeModules(electronVersion, './node_modules');
        done();
      });
    }).catch(function(e) {
      console.log('Error :: ' + e.message);
    });
  };

  grunt.registerTask('rebuild', rebuildNativeModules);
};
