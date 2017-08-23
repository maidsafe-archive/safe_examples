import { app, BrowserWindow, Menu } from 'electron';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let template;
let menu;

const sendResponse = (res) => {
  mainWindow.webContents.send('auth-response', res ? res : '');
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    resizable: false,
    width: 1024,
    height: 728
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
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

  template = [{
    label: '&File',
    submenu: [{
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
        shell.openExternal('https://github.com/maidsafe/safe_examples/tree/master/email_app/README.md');
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

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('open-url', function (e, url) {
  sendResponse(url);
});
