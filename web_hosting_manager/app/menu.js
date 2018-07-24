import { app, Menu, MenuItem, shell } from 'electron';
import pkg from '../package.json';

export default class MenuBuilder {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    // this.mainWindow.openDevTools();
    // if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    // }

    let template;

    if (process.platform === 'darwin') {
      template = this.buildDarwinTemplate();
    } else {
      template = this.buildDefaultTemplate();
    }

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu
        .buildFromTemplate([{
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          },
        }])
        .popup(this.mainWindow);
    });
  }

  buildSimulationMenuItems() {
    const simulateMockResponse = () => {
      this.mainWindow.webContents.send('simulate-mock-res');
    };
    let menu = null;

    // add mock response simulation to menu
    if (process.env.NODE_ENV === 'development') {
      menu = [];
      menu.unshift(new MenuItem({
        label: '&Simulate Mock Response',
        click() {
          simulateMockResponse();
        },
      }));
    }

    return menu;
  }

  buildAppLogsMenuItem() {
    const OpenAppLogs = () => {
      this.mainWindow.webContents.send('show-log-file');
    };
    let menu = [];

    menu.unshift(new MenuItem({
      label: '&Open log file',
      click() {
        OpenAppLogs();
      },
    }));

    return menu;
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: pkg.productName,
      submenu: [
        { label: `About ${pkg.productName}`, selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        { label: `Hide ${pkg.productName}`, accelerator: 'Command+H', selector: 'hide:' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', selector: 'hideOtherApplications:' },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:' },
      ],
    };
    const subMenuViewDev = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow = {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:' },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://maidsafe.net');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal('https://github.com/maidsafe/safe_examples/tree/master/web_hosting_manager/README.md');
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://forum.safedev.org');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/maidsafe/safe_examples/issues');
          },
        },
      ],
    };

    const subMenuView = process.env.NODE_ENV === 'development'
      ? subMenuViewDev
      : subMenuViewProd;

    const simulationMenuItems = this.buildSimulationMenuItems();
    const appLogsMenuItems = this.buildAppLogsMenuItem();
    if (simulationMenuItems) {
      subMenuAbout.submenu = simulationMenuItems.concat(subMenuAbout.submenu);
    }
    if (appLogsMenuItems) {
      subMenuAbout.submenu = appLogsMenuItems.concat(subMenuAbout.submenu);
    }
    return [
      subMenuAbout,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      subMenuHelp,
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [{
      label: '&File',
      submenu: [{
        label: '&Open',
        accelerator: 'Ctrl+O',
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click: () => {
          this.mainWindow.close();
        },
      }],
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click: () => {
          this.mainWindow.webContents.reload();
        },
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        },
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click: () => {
          this.mainWindow.toggleDevTools();
        },
      }] : [{
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        },
      }],
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('https://maidsafe.net');
        },
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/maidsafe/safe_examples/tree/master/web_hosting_manager/README.md');
        },
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://forum.safedev.org');
        },
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/maidsafe/safe_examples/issues');
        },
      }],
    }];

    const simulationMenuItems = this.buildSimulationMenuItems();
    const appLogsMenuItems = this.buildAppLogsMenuItem();
    if (simulationMenuItems) {
      templateDefault[0].submenu = simulationMenuItems.concat(templateDefault[0].submenu);
    }
    if (appLogsMenuItems) {
      templateDefault[0].submenu = appLogsMenuItems.concat(templateDefault[0].submenu);
    }

    return templateDefault;
  }
}
