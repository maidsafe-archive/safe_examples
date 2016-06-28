var temp = require('temp').track();
var path = require('path');
var fs = require('fs');
var jetpack = require('fs-jetpack');
var util = require('util');

export let createTemplateFile = function(title, content, dirPath, callback) {
  var tempDirName = 'safe_uploader_template';
  var title = title;
  var content = content;
  dirPath = path.resolve(__dirname, dirPath);
  try {
    var tempDirPath = temp.mkdirSync(tempDirName);
    jetpack.copy(dirPath, tempDirPath, { overwrite: true });    
    var htmlFilePath = path.resolve(tempDirPath, 'index.html');
    var templateString = fs.readFileSync(htmlFilePath).toString();
    // var tempFilePath = path.resolve(tempDirPath, 'index.html');
    fs.writeFileSync(htmlFilePath,
      util.format(templateString, title, title, content));
    return callback(null, tempDirPath);
  } catch (e) {
    return callback(e);
  }
};
