var temp = require('temp').track();
var path = require('path');
var fs = require('fs');
var util = require('util');

export let createTemplateFile = function(title, content, filePath, callback) {
  var tempDirName = 'safe_uploader_template';
  var title = title;
  var content = content;
  filePath = __dirname + filePath;
  var fileName = 'index.html';
  try {
    var tempDirPath = temp.mkdirSync(tempDirName);
    var templateString = fs.readFileSync(filePath).toString();
    var tempFilePath = path.resolve(tempDirPath, fileName);
    fs.writeFileSync(tempFilePath,
        util.format(templateString, title, title, content));
    return callback(null, tempDirPath);
  } catch (e) {
    return callback(e);
  }
};
