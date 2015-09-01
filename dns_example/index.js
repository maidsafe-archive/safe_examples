'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
var path = require('path');

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

console.log(__dirname);
var srcFolder = (__dirname.indexOf('asar') === -1) ? path.resolve('src') : path.resolve(__dirname, 'src/');

function createMainWindow () {
	const win = new BrowserWindow({
		width: 1024,
		height: 640,
		center: true,
		resizable: true,
		'min-width': 1020,
		'min-height': 640,
		icon: srcFolder + '/imgs/logo.png'
	});

	win.loadUrl(`file://${__dirname}/src/views/index.html`);
	win.on('closed', onClosed);

	return win;
}

function onClosed() {
	// deref the window
	// for multiple windows store them in an array
	mainWindow = null;
}

// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', function () {
	mainWindow = createMainWindow();
	//mainWindow.openDevTools();
});
