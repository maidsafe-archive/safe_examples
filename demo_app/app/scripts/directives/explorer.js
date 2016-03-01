window.maidsafeDemo.directive('explorer', ['$rootScope', '$timeout', 'safeApiFactory',
  function($rootScope, $timeout, safeApi) {
    var PROGRESS_DELAY = 500;
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
      $scope.isFileSelected = null;
      $scope.listSelected = false;

      var releaseSelection = function() {
        $(document).on('mouseup', function(e) {
          var listItems = $('.ms-list-2-i');
          if (!listItems.is(e.target) && listItems.has(e.target).length === 0) {
            $scope.listSelected = false;
            listItems.removeClass('active');
          }
        });
      };

      var getDirectory = function() {
        $rootScope.$loader.show();
        var onResponse = function(err, dir) {
          $rootScope.$loader.hide();
          if (err) {
            return console.error(err);
          }
          $scope.dir = JSON.parse(dir);
          $scope.$applyAsync();
        };
        safeApi.getDir(onResponse, $scope.currentDirectory, false);
      };

      // bytes to size
      $scope.bytesToSize = function(bytes) {
        if (isNaN(bytes)) {
          return '0 Bytes';
        }
         var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
         if (bytes == 0) return '0 Byte';
         var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
         return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      };

      // get file icon
      $scope.getFileIconClass = function(fileName) {
        fileName = fileName.split('.');
        var ext = fileName[fileName.length - 1];
        ext = ext.toLowerCase();

        var imgExt = ['jpeg', 'jpg', 'png', 'gif', 'ttf'];
        var textExt = ['txt', 'doc', 'docx'];
        var audioExt = ['mp3', 'wav'];
        var videoExt = ['mpeg', 'mp4', 'avg'];
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
          var uploader = new window.uiUtils.Uploader(safeApi);
          var networkPath = $scope.currentDirectory;
          if (!isFile) {
            var dirName = selection[0].split('\\');
            dirName = dirName[dirName.length - 1];
            networkPath += ('/' + dirName);
          }
          try {
            var progress = uploader.upload(selection[0], $scope.isPrivate, networkPath);
            progress.onUpdate = function() {
              if ($rootScope.$loader.isLoading) {
                $rootScope.$loader.hide();
              }
              var progressCompletion = (((progress.completed + progress.failed) / progress.total) * 100);
              $scope.onProgress({
                percentage: progressCompletion,
                isUpload: true
              });
              if (progressCompletion === 100) {
                $timeout(getDirectory, PROGRESS_DELAY);
              } else if (progressCompletion > 100) { //patch fix
                $rootScope.$loader.hide();
                $rootScope.prompt.show('MaidSafe Demo', 'Upload failed');
              }
            };
          } catch(err) {
            $rootScope.$loader.hide();
            $rootScope.prompt.show('MaidSafe Demo', 'Cannot upload files above 1 Mb');
          }
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

      $scope.download = function(fileName, size) {
        $scope.listSelected = false;
        $scope.isFileSelected = true;
        $scope.selectedPath = fileName;
        $rootScope.$loader.show();
        var downloader = new window.uiUtils.Downloader(safeApi,
          $scope.currentDirectory + $scope.selectedPath, size, false);
        downloader.setOnCompleteCallback(function(err) {
          if (err) {
            console.log(err);
            $rootScope.prompt.show('MaidSafe Demo', 'Download failed');
          }
          downloader.open();
        });
        downloader.setStatusCallback(function(status) {
          $rootScope.$loader.hide();
          $scope.onProgress({
            percentage: status,
            isUpload: false
          });
        });
        downloader.download();
      };

      $scope.delete = function() {
        var path = $scope.currentDirectory + '/' + $scope.selectedPath;
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
        $scope.listSelected = false;
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
      releaseSelection();
      getDirectory();
    };

    return {
      restrict: 'E',
      scope: {
        isPrivate: '=',
        startingPath: '=',
        onDirectorySelected: '&',
        onProgress: '&'
      },
      templateUrl: './views/explorer.html',
      link: Explorer
    };
  }
]);
