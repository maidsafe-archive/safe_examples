import { app, BrowserWindow, Menu, shell, ipc } from 'electron';

let menu;
let template;
let mainWindow = null;

const mockRes = () => {
  sendResponse('safe-bmV0Lm1haWRzYWZlLndlYmhvc3RpbmdtYW5hZ2Vy:AQAAAH1cjoIAAAAAAAAAACAAAAAAAAAA7P8vAEC9m7Sg3XwbbF75mVYf5Apa84aqRquCTyAG7uogAAAAAAAAALEeq-DebDWqsqMjO6GB55F-hajEy1j0NZlfkMSBxLzwIAAAAAAAAABo4PmCcwPYR_1VAeVx8Y80b0TZHrsrfVRjeb-EAYD5b0AAAAAAAAAAVp72yqqMbhKIpM-2jQsCAm7VZrTAEAxYoX5NREaqCrpo4PmCcwPYR_1VAeVx8Y80b0TZHrsrfVRjeb-EAYD5byAAAAAAAAAAIhs_lgWeR8BPeaRl1wGRwhJFGbpnnIVYUPWGgbd3mHAgAAAAAAAAAIV5WXjkhUWLZNNdDFQ4ZeUfU-uXdByjXIq0Exdat2STAAAAAAAAAAAAAAAAAAAAAO-bo10EfLz8YGB0DZbt7KvhxtVNiF4X0g8qRF7wf-bdmDoAAAAAAAAYAAAAAAAAACPXPpWkSSQ687emzE7ZYT_IoHj1icBBEg==');
};

const sendResponse = (success) => {
  mainWindow.webContents.send('auth-response', success ? success : '');
};

const clearAccessData = () => {
  mainWindow.webContents.send('clear-access-data', true);
};


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) { // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    fullscreen: false,
    resizable: false
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const shouldQuit = app.makeSingleInstance(function(commandLine) {
    if (commandLine.length >= 2 && commandLine[1]) {
      sendResponse(commandLine[1]);
    }

    // Someone tried to run a second instance, we should focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  if (shouldQuit) {
    app.quit();
  }
  mainWindow.openDevTools();
  if (process.env.NODE_ENV === 'development') {
    // mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }

  if (process.platform === 'darwin') {
    template = [{
      label: 'SAFE Hosting Manager',
      submenu: [{
        label: 'About',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        label: '&Clear Access Data',
        click() {
          clearAccessData();
        }
      }, {
        label: '&Mock res',
        click() {
          mockRes();
        }
      }, {
        type: 'separator'
      }, {
        label: 'Hide',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
          label: 'Reload',
          accelerator: 'Command+R',
          click() {
            mainWindow.webContents.reload();
          }
        }, {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }, {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click() {
            mainWindow.toggleDevTools();
          }
        }] : [{
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('https://maidsafe.net');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/maidsafe/safe_examples/tree/master/web_hosting_manager/README.md');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://forum.safedev.org');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/maidsafe/safe_examples/issues');
        }
      }]
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      label: '&File',
      submenu: [{
        label: '&Clear Access Data',
        accelerator: 'Ctrl+D',
        click() {
          clearAccessData();
        }
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click() {
          mainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click() {
            mainWindow.webContents.reload();
          }
        }, {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }, {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click() {
            mainWindow.toggleDevTools();
          }
        }] : [{
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click() {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('https://maidsafe.net');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/maidsafe/safe_examples/tree/master/web_hosting_manager/README.md');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://forum.safedev.org');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/maidsafe/safe_examples/issues');
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
});

app.on('open-url', function (e, url) {
  sendResponse(url);
});
