window.maidsafeDemo.directive('explorer', [ '$rootScope', '$state', '$timeout', '$filter', 'safeApiFactory',
  function($rootScope, $state, $timeout, $filter, safeApi) {
    var PROGRESS_DELAY = 500;
    var Explorer = function($scope, element, attrs) {
      var FILE_ICON_CLASSES = {
        GENERIC: 'ms-icn-file-generic',
        IMAGE: 'ms-icn-file-img',
        AUDIO: 'ms-icn-file-audio',
        TEXT: 'ms-icn-file-txt',
        VIDEO: 'ms-icn-file-video'
      };

      $scope.rootDirectories = [
        {
          displayName: 'Public folder',
          name: 'public',
          description: 'Public data is content that you wish to share with other \
          users, such as websites. Public data is not encrypted and therefore not \
          suitable for information which you wish to remain private.'
        },
        {
          displayName: 'Private folder',
          name: 'private',
          description: 'Private data is always encrypted and only accessible \
          to you, it is therefore well suited for data which you wish to remain confidential.'
        },
      ];

      $scope.currentDirectory = '/' + ($scope.startingPath ? ($scope.startingPath + '/') : '');
      $scope.mime = require('mime');
      $scope.selectedPath = null;
      $scope.dir = null;
      $scope.isFileSelected = null;
      $scope.listSelected = false;

      var releaseSelection = function() {
        $(document).on('mouseup', function(e) {
          var listItems = $('.ms-list-2-i');
          var explorer = $('.ms-explr');
          if (!listItems.is(e.target) && (listItems.has(e.target).length === 0) && (explorer.has(e.target).length !== 0)) {
            if ($scope.listSelected) {
              $scope.onDirectorySelected({
                name: null
              });
              $scope.listSelected = false;
            }
            listItems.removeClass('active');
          }
        });
      };

      var getDirectory = function() {
        if ($scope.currentDirectory === '/') {
          $scope.dir = [];
          return;
        }
        $rootScope.$loader.show();
        var onResponse = function(err, dir) {
          $rootScope.$loader.hide();
          if (err) {
            return console.error(err);
          }
          $scope.dir = dir;
          $scope.$applyAsync();
          if ($scope.listMode && attrs.selectTarget) {
            $timeout(function() {
              var dirNameList = $scope.dir.subDirectories.map(function(d) {
                return d.name;
              });
              dirNameList.sort(function(a, b) {
                return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1;
              });
              var targetFolder = element.find('.ms-list-2 .ms-list-2-i')[dirNameList.indexOf(attrs.selectTarget) + 1];
              if (targetFolder) {
                var targetFolderEle = angular.element(targetFolder);
                targetFolderEle.click();
                element.find('.ms-explr-cont').scrollTop(targetFolderEle.position().top);
              }
            }, 200);
          }
        };
        safeApi.getDir(onResponse, $scope.currentDirectory, false);
      };

      // bytes to size
      $scope.bytesToSize = function(bytes) {
        if (isNaN(bytes)) {
          return '0 Bytes';
        }
        var sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];
        if (bytes === 0) {
          return '0 Byte';
        }
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      };

      // get file icon
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
          title: 'Select ' + (isFile ? 'File' : 'Directory') + ' for upload',
          properties: isFile ? [ 'openFile' ] : [ 'openDirectory' ]
        }, function(selection) {
          if (!selection || selection.length === 0) {
            return;
          }
          $rootScope.$loader.show();

          var networkPath = $scope.currentDirectory;
          if (!isFile) {
            var dirName = selection[0].split(require('path').sep);
            dirName = dirName[dirName.length - 1];
            networkPath += dirName;
          }
          try {
            var progressCallback = function(completed, total, countStatus) {
              if ($rootScope.$loader.isLoading) {
                $rootScope.$loader.hide();
              }
              var progressCompletion = 100;
              if (!(total === 0 && completed === 0)) {
                progressCompletion = ((completed / total) * 100);
              }
              $scope.onProgress({
                percentage: progressCompletion,
                isUpload: true,
                status: countStatus
              });
              if (progressCompletion === 100) {
                getDirectory();
              }
            };
            var uploader = new window.uiUtils.Uploader(safeApi, progressCallback);
            uploader.setOnErrorCallback(function(msg) {
              // TODO Krishna - progressbar has too many inderictions - try to make it simpler
              $scope.onProgress({
                percentage: 100,
                isUpload: true,
                status: ''
              });
              if (msg.data) {
                msg = msg.data.description;
              }
              $rootScope.prompt.show('Failed to create file', msg.split('\n')[0], function() {
                getDirectory();
              }, { title: 'Reason', ctx: msg.split('\n')[1] });
            });
            uploader.upload(selection[0], $scope.isPrivate, networkPath);
          } catch (err) {
            console.error(err);
            $rootScope.$loader.hide();
            $rootScope.prompt.show('Failed to create file', err.message);
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
          $scope.currentDirectory + $scope.selectedPath, size, false, $rootScope.tempDirPath);
        downloader.setOnCompleteCallback(function(err) {
          if (err) {
            console.log(err);
            return $rootScope.prompt.show('MaidSafe Demo', 'Download failed', function() {
              $rootScope.progressBar.close();
            },
            {
              title: 'Reason',
              ctx: err
            });
          }
          $('.ms-list-2-i').removeClass('active');
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
            console.error(err)
            $rootScope.prompt.show('MaidSafe Demo', 'Delete failed', function() {}, {
              title: 'Reason',
              ctx: err.data.description
            });
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
        if ($scope.listMode) {
          return;
        }
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
        var targetFolder = tokens.pop();
        var path = tokens.join('/');
        $scope.isPrivate = (targetFolder.toLowerCase() === 'private');
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
        listMode: '=',
        startingPath: '=',
        onDirectorySelected: '&',
        onProgress: '&'
      },
      templateUrl: './views/explorer.html',
      link: Explorer
    };
  }
]);
