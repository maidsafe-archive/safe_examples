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

      var uploader;

      $scope.rootDirectories = [
        {
          displayName: 'Public folder',
          name: 'public',
          description: 'Public data is content that you wish to share with other ' +
          'users, such as websites. Public data is not encrypted and therefore not 2' +
          'suitable for information which you wish to remain private.'
        },
        {
          displayName: 'Private folder',
          name: 'private',
          description: 'Private data is always encrypted and only accessible ' +
          'to you, it is therefore well suited for data which you wish to remain confidential.'
        }
      ];
      var MANIPULATE_ACTION = {
        MOVE: 'move',
        COPY: 'copy'
      };
      $scope.currentDirectory = '/' + ($scope.startingPath ? ($scope.startingPath + '/') : '');
      $scope.mime = require('mime');
      $scope.selectedPath = null;
      $scope.dir = null;
      $scope.isFileSelected = null;
      $scope.listSelected = false;
      $scope.selectedEle = null;
      $scope.currentManipulateAction = null;
      $scope.currentManipulatePath = null;
      $scope.currentManipulateSelectedIsFile = null;

      var selection = function(target, name, isFile) {
        var reset = function() {
          $('.ms-list-2-i').removeClass('active');
          if (target.className && target.className.split(' ').indexOf('edit') === -1) {
            resetRename();
          }
        };
        reset();
        var ele = angular.element(target);
        $scope.selectedEle = ele;
        $scope.listSelected = true;
        ele.addClass('active');
        $scope.isFileSelected = isFile;
        $scope.selectedPath = name;
        $scope.$applyAsync();
        if (isFile || !$scope.onDirectorySelected) {
          return;
        }
        $scope.onDirectorySelected({
          name: $scope.currentDirectory + $scope.selectedPath + '/'
        });
      };

      var resetRename = function() {
        var listItems = $('.ms-list-2-i');
        var renameField = $('.ms-list-2-i .rename input[name=rename]');
        renameField.val(function() {
          return this.dataset.originalVal;
        });
        listItems.removeClass('edit');
      };

      var resetPaste = function() {
        $scope.currentManipulateAction = null;
        $scope.currentManipulatePath = null;
        $scope.currentManipulateSelectedIsFile = null;
      };

      var resetSelection = function() {
        $scope.listSelected = false;
      };

      var resetCut = function() {
        $('.ms-list-2-i').removeClass('cut');
      };

      var showContextMenu = function(e) {
        var contextMenu = $('#ContextMenu');
        var listItems = $('.ms-list-2-i');
        var list = $('.ms-list-2');
        var targetList = null;
        resetSelection();
        if ($(e.target).is(listItems)) {
          targetList = e.target;
        }
        if ($(e.target.parentElement).is(listItems)) {
          targetList = e.target.parentElement;
        }
        if ($(e.target).is(list)) {
          targetList = e.target;
        }
        if (!targetList) {
          return;
        }
        var targetName = targetList.dataset.name;
        var targetIsFile = targetList.dataset.isFile ? JSON.parse(targetList.dataset.isFile) : false;
        if (targetName) {
          selection(targetList, targetName, targetIsFile);
        }
        var posX = e.clientX;
        var posY = e.clientY;
        contextMenu.show();
        contextMenu.css('top', posY);
        contextMenu.css('left', posX);
        $scope.$applyAsync();
      };

      var hideContextMenu = function() {
        var contextMenu = $('#ContextMenu');
        if ($scope.selectedEle) {
          $scope.selectedEle.removeClass('active');
        }
        contextMenu.hide();
        contextMenu.css('top', 0);
        contextMenu.css('left', 0);
      };

      var releaseSelection = function() {
        $(document).on('mouseup', function(e) {
          var listItems = $('.ms-list-2-i');
          var explorer = $('.ms-explr');
          var contextMenu = $('#ContextMenu');

          // show context menu
          if (e.button === 2) {
            return showContextMenu(e);
          }
          hideContextMenu();
          if (!listItems.is(e.target) && (listItems.has(e.target).length === 0) &&
            (explorer.has(e.target).length !== 0) && (contextMenu.has(e.target).length === 0)) {
            if ($scope.listSelected) {
              $scope.onDirectorySelected({
                name: null
              });
              resetSelection();
            }
            resetRename();
            listItems.removeClass('active');
          }
          var dropdown = $('.ms-dropdown .ms-dropdown-b');
          if (!dropdown.is(e.target) && (dropdown.has(e.target).length === 0)) {
            $scope.uploadDialog = false;
          }
          $scope.$applyAsync();
        });
      };

      var getDirectory = function() {
        if ($scope.currentDirectory === '/') {
          $scope.dir = [];
          return;
        }
        $rootScope.$loader.show();
        var setCutItem = function() {
          var dirName = $scope.currentManipulatePath;
          var baseName = '';
          if (dirName.slice(-1) === '/') {
            dirName = dirName.slice(0, -1);
          }
          dirName = dirName.split('/');
          baseName = dirName.pop();
          dirName = dirName.join('/') + '/';
          if ($scope.currentDirectory !== dirName) {
            return;
          }
          angular.element(element.find('.ms-list-2 .ms-list-2-i[data-name="' + baseName + '"]')).addClass('cut');
        };

        var onResponse = function(err, dir) {
          $rootScope.$loader.hide();
          if (err) {
            return $rootScope.prompt.show('Operation Failed', 'Failed to fetch Directory', function() {
            }, { title: 'Reason', ctx: err.data.description });
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
          if ($scope.currentManipulateAction === MANIPULATE_ACTION.MOVE) {
            $timeout(function() {
              setCutItem();
            }, 50);
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
            uploader = new window.uiUtils.Uploader(safeApi, progressCallback);
            uploader.setOnErrorCallback(function(msg) {
              uploader = null;
              // TODO Krishna - progressbar has too many inderictions - try to make it simpler
              $scope.onProgress({
                percentage: 100,
                isUpload: true,
                status: ''
              });
              if (msg.data) {
                msg = msg.data.description;
              }
              $rootScope.prompt.show('Operation Failed', msg.split('\n')[0], function() {
                getDirectory();
              }, { title: 'Reason', ctx: msg.split('\n')[1] });
            });
            uploader.upload(selection[0], $scope.isPrivate, networkPath);
          } catch (err) {
            $rootScope.$loader.hide();
            $rootScope.prompt.show('Operation Failed', err.message);
          }
        });
      };

      $scope.renameTarget = function(e) {
        var renameEle = e.target.children.rename;
        var reset = function() {
          $('.ms-list-2-i').removeClass('active');
        };
        if (renameEle.nodeName !== 'INPUT') {
          return;
        }
        var newName = renameEle.value;
        if (!newName) {
          return;
        }
        reset();
        var fileOrFolderlist = $scope.isFileSelected ? $scope.dir.files.map(function(obj) {
          return obj.name;
        }) : $scope.dir.subDirectories.map(function(obj) {
          return obj.name;
        });
        if ((newName === renameEle.dataset.originalVal) || (fileOrFolderlist.indexOf(newName) !== -1)) {
          return resetRename();
        }
        var callback = function(err) {
          $rootScope.$loader.hide();
          if (err) {
            $rootScope.prompt.show('Operation Failed', 'Failed to rename ' +
            ($scope.isFileSelected ? 'file' : 'directory'), function() {},
            {
              title: 'Reason',
              ctx: err.data.description
            });
          }
          getDirectory();
        };
        var oldPath = $scope.currentDirectory + '/' + $scope.selectedPath;
        $rootScope.$loader.show();
        if ($scope.isFileSelected) {
          safeApi.renameFile(oldPath, false, newName, callback);
        } else {
          safeApi.renameDirectory(oldPath, false, newName, callback);
        }
      };

      $scope.download = function(e, fileName, size) {
        if ($(e.target).is($('.ms-list-2-i .rename input[name=rename]'))) {
          return;
        }
        $scope.listSelected = false;
        $scope.isFileSelected = true;
        $scope.selectedPath = fileName;
        $rootScope.$loader.show();
        var downloader = new window.uiUtils.Downloader(safeApi,
          $scope.currentDirectory + $scope.selectedPath, size, false, $rootScope.tempDirPath);
        downloader.setOnCompleteCallback(function(err) {
          if (err) {
            return $rootScope.prompt.show('Operation Failed', 'Failed to download ' +
            ($scope.isFileSelected ? 'file' : 'directory'), function() {
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

      $scope.deleteAction = function() {
        resetPaste();
        resetSelection();
        var path = $scope.currentDirectory + '/' + $scope.selectedPath;
        $rootScope.$loader.show();
        var onDelete = function(err) {
          $rootScope.$loader.hide();
          if (err) {
            $rootScope.prompt.show('Operation Failed', 'Failed to delete ' +
            ($scope.isFileSelected ? 'file' : 'directory'), function() {}, {
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

      $scope.openDirectory = function(e, directoryName) {
        if ($scope.listMode || ($(e.target).is($('.ms-list-2-i .rename input[name=rename]')))) {
          return;
        }
        $scope.listSelected = false;
        $scope.selectedPath = directoryName;
        var selectedDir = $scope.currentDirectory + $scope.selectedPath;
        if (($scope.currentManipulatePath === selectedDir) &&
          $scope.currentManipulateAction === MANIPULATE_ACTION.MOVE) {
          resetPaste();
          resetCut();
          $('.ms-list-2-i').removeClass('active');
          return;
        }
        $scope.currentDirectory = selectedDir + '/';
        $scope.selectedPath = '';
        getDirectory();
      };

      $scope.select = function($event, name, isFile) {
        var renameInput = $('.ms-list-2-i-ctx.rename');
        if (renameInput.is($event.target) || (renameInput.has($event.target).length !== 0)) {
          $($event.target).parents('.ms-list-2-i').addClass('active');
          return;
        }
        selection($event.currentTarget, name, isFile);
      };

      $scope.showRenameField = function() {
        resetSelection();
        resetPaste();
        resetCut();
        $scope.selectedEle.addClass('active edit');
        $scope.selectedEle.children('.rename').find('input').select();
      };

      $scope.cutAction = function() {
        $scope.currentManipulateAction = MANIPULATE_ACTION.MOVE;
        $scope.currentManipulatePath = $scope.currentDirectory + $scope.selectedPath;
        $scope.currentManipulateSelectedIsFile = $scope.isFileSelected;
        if ($scope.selectedEle) {
          $scope.selectedEle.addClass('cut');
        }
        $scope.selectedPath = null;
        resetSelection();
      };

      $scope.copyAction = function() {
        $scope.currentManipulateAction = MANIPULATE_ACTION.COPY;
        $scope.currentManipulatePath = $scope.currentDirectory + $scope.selectedPath;
        $scope.currentManipulateSelectedIsFile = $scope.isFileSelected;
        $scope.selectedPath = null;
        resetSelection();
        resetCut();
      };

      $scope.pasteAction = function() {
        var reset = function() {
          $scope.currentManipulatePath = null;
          $scope.currentManipulateAction = null;
          resetSelection();
        };

        var moveCallback = function(err, res) {
          $rootScope.$loader.hide();
          if (err) {
            $rootScope.prompt.show('Operation Failed', 'Failed to move ' +
              ($scope.currentManipulateSelectedIsFile ? 'file' : 'directory'), function() {}, {
              title: 'Reason',
              ctx: err.data.description
            });
          }
          reset();
          getDirectory();
        };

        var copyCallback = function(err, res) {
          $rootScope.$loader.hide();
          if (err) {
            $rootScope.prompt.show('Operation Failed', 'Failed to copy ' +
              ($scope.currentManipulateSelectedIsFile ? 'file' : 'directory'), function() {}, {
              title: 'Reason',
              ctx: err.data.description
            });
          }
          reset();
          getDirectory();
        };
        $rootScope.$loader.show();
        var selectedPath = '';
        if ($scope.isFileSelected) {
          selectedPath = $scope.currentDirectory;
        } else {
          selectedPath = $scope.selectedPath ? ($scope.currentDirectory + $scope.selectedPath) :
            $scope.currentDirectory;
        }
        selectedPath += '/';
        if ($scope.currentManipulateSelectedIsFile) {
          if ($scope.currentManipulateAction === MANIPULATE_ACTION.MOVE) {
            safeApi.moveFile($scope.currentManipulatePath, false, selectedPath, false, moveCallback);
          } else {
            safeApi.copyFile($scope.currentManipulatePath, false, selectedPath, false, copyCallback);
          }
        } else {
          if ($scope.currentManipulateAction === MANIPULATE_ACTION.MOVE) {
            safeApi.moveDirectory($scope.currentManipulatePath, false, selectedPath, false, moveCallback);
          } else {
            safeApi.copyDirectory($scope.currentManipulatePath, false, selectedPath, false, copyCallback);
          }
        }
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

      $scope.$on('cancel-upload', function() {
        if (!uploader) {
          return;
        }
        uploader.cancel();
      });

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
