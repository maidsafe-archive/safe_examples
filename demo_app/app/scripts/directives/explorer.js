window.maidsafeDemo.directive('explorer', ['$rootScope', 'safeApiFactory', function($rootScope, safeApi) {

  var Explorer = function($scope, element, attrs) {
    var rootFolder = '/' + ($scope.isPrivate ? 'private' : 'public') + '/';
    var FILE_ICON_CLASSES = {
      GENERIC: 'ms-icn-file-generic',
      IMAGE: 'ms-icn-file-img',
      AUDIO: 'ms-icn-file-audio',
      TEXT: 'ms-icn-file-txt',
      VIDEO: 'ms-icn-file-video'
    };

    $scope.currentDirectory = rootFolder + ($scope.startingPath ? ($scope.startingPath + '/') : '');
    $scope.mime = require('mime');
    $scope.selectedPath = null;
    $scope.dir = null;
    $scope.isFileSelected;
    $scope.listSelected = false;

    var getDirectory = function() {
      var onResponse = function(err, dir) {
        if (err) {
          return console.error(err);
        }
        $scope.dir = JSON.parse(dir);
        $scope.$applyAsync();
      };
      safeApi.getDir(onResponse, $scope.currentDirectory, false);
    };

    $scope.getFileIconClass = function(fileName) {
      fileName = fileName.split('.');
      var ext = fileName[ fileName.length - 1 ];
      ext = ext.toLowerCase();

      var imgExt = [ 'jpeg', 'jpg', 'png', 'gif', 'ttf' ];
      var textExt = [ 'txt', 'doc', 'docx' ];
      var audioExt = [ 'mp3', 'wav' ];
      var videoExt = [ 'mpeg', 'mp4', 'avg' ];
      var fileType = FILE_ICON_CLASSES.GENERIC;
      if (imgExt.indexOf(ext) !== -1) {
        fileType = FILE_ICON_CLASSES.IMAGE;
      }
      if (textExt.indexOf(ext) !== -1) {
        fileType = FILE_ICON_CLASSES.TEXT;
      }
      if (audioExt.indexOf(ext) !== -1) {
        fileType = FILE_ICON_CLASSES.AUDIO;
      }
      if (videoExt.indexOf(ext) !== -1) {
        fileType = FILE_ICON_CLASSES.VIDEO;
      }
      return fileType;
    };

    $scope.upload = function(isFile) {
      $scope.uploadDialog = false;
      var dialog = require('remote').dialog;
      dialog.showOpenDialog({
        title: 'Select Directory for upload',
        properties: isFile ? [] : ['openDirectory']
      }, function(selection) {
        if (!selection || selection.length === 0) {
          return;
        }
        $rootScope.$loader.show();
        // TODO instead of binding uploader to window use require
        var uploader = new window.uiUtils.Uploader(safeApi);
        var networkPath = $scope.currentDirectory;
        if (!isFile) {
          var dirName = selection[0].split('\\');
          dirName = dirName[ dirName.length - 1 ];
          networkPath += ('/' + dirName);
        }
        var progress = uploader.upload(selection[0], $scope.isPrivate, networkPath);
        progress.onUpdate = function() {
          if ($rootScope.$loader.isLoading) {
            $rootScope.$loader.hide();
          }
          var progressCompletion = (((progress.completed + progress.failed) / progress.total) * 100);
          if (progressCompletion === 100) {
            getDirectory();
          }
          $scope.onUpload({
            percentage: progressCompletion
          });
        };
      });
    };

    $scope.rename = function(newName) {
      var callback = function(err) {
        if (err) {
          alert('Rename failed');
        }
        getDirectory();
      };
      var oldPath = $scope.currentDirectory + $scope.selected;
      if ($scope.isFileSelected) {
        safeApi.renameFile(oldPath, false, newName, callback);
      } else {
        safeApi.renameDirectory(oldPath, false, newName, callback);
      }
    };

    $scope.download = function(fileName) {
      $scope.isFileSelected = true;
      $scope.selectedPath = fileName;
      $rootScope.$loader.show();
      var onResponse = function(err, data) {
        $rootScope.$loader.hide();
        if (err) {
          return console.error(err);
        }
        var tempDir = require('temp').mkdirSync('safe-demo-');
        var filePath = require('path').resolve(tempDir, fileName);
        require('fs').writeFileSync(filePath, new Buffer(data));
        window.downData = data;
        require('remote').shell.openItem(filePath);
      };
      safeApi.getFile($scope.currentDirectory + $scope.selectedPath, false, onResponse);
    };

    $scope.delete = function() {
      var path = $scope.currentDirectory + '/' + $scope.selectedPath;
      $scope.listSelected = false;
      $rootScope.$loader.show();
      var onDelete = function(err) {
        $rootScope.$loader.hide();
        if (err) {
          return console.error(err);
        }
        getDirectory();
      };
      if ($scope.isFileSelected) {
        safeApi.deleteFile(path, false, onDelete);
      } else {
        safeApi.deleteDirectory(path, false, onDelete);
      }
    };

    $scope.openDirectory = function(directoryName) {
      $scope.selectedPath = directoryName;
      $scope.currentDirectory += ($scope.selectedPath + '/');
      getDirectory();
    };

    $scope.select = function($event, name, isFile) {
      var reset = function() {
        $('.ms-list-2-i').removeClass('active');
      };
      reset();
      var ele = angular.element($event.currentTarget);
      $scope.listSelected = true;
      ele.addClass('active');
      $scope.isFileSelected = isFile;
      $scope.selectedPath = name;
      window.sc = $scope;
      if (isFile || !$scope.onDirectorySelected) {
        return;
      }
      $scope.onDirectorySelected({
        name: $scope.currentDirectory + $scope.selectedPath + '/'
      });
    };

    $scope.back = function() {
      var tokens = $scope.currentDirectory.split('/');
      tokens.pop();
      tokens.pop();
      var path = tokens.join('/');
      if (!path) {
        return;
      }
      $scope.currentDirectory = path + '/';
      $scope.selectedPath = null;
      getDirectory();
    };

    $scope.rename = false;
    getDirectory();
  };

  return {
    restrict: 'E',
    scope: {
      isPrivate: '=',
      startingPath: '=',
      onDirectorySelected: '&',
      onUpload: '&'
    },
    templateUrl: './views/explorer.html',
    link: Explorer
  };
}]);
