//jshint esversion: 6
const electron = require('electron');
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = electron;
const path = require('path');
const { powerSaveBlocker } = require('electron');
const fs = require("fs");
const https = require("https");
const opn = require('opn');

const file = fs.createWriteStream("version.json");
var currentVersion = '2.0.1';

const id = powerSaveBlocker.start('prevent-app-suspension');
console.log(powerSaveBlocker.isStarted(id));

let win;

var iconpath = path.join(__dirname, "256x256.png");

const options = {
	type: 'question',
	buttons: ['Cancel', 'Yes, update now', 'Ask me later'],
	defaultId: 2,
	title: 'New update',
	message: 'New update available. Do you want to install it?',
	detail: 'It does not really matter',
};

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({ width: 600, height: 600, icon: iconpath });

	win.loadFile('index.html');

	var appIcon = new Tray(iconpath);

	var contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App', click: function () {
				win.show();
			}
		},
		{
			label: 'Quit', click: function () {
				app.isQuiting = true;
				app.quit();
			}
		}
	]);

	appIcon.setContextMenu(contextMenu);

	win.on('close', function (event) {
		if (!app.isQuiting) {
			event.preventDefault();
			win.hide();
		}
		return false;
	});

	win.on('minimize', function (event) {
		event.preventDefault();
		win.hide();
	});

	win.on('show', function () {
		appIcon.setHighlightMode('always');
	});

}

app.on('ready', () => {
	createWindow();
	electron.powerMonitor.on('suspend', () => {
		console.log('The system is going to sleep');
	});
	electron.powerMonitor.on('resume', () => {
		console.log('The system is resumed');
	});
	checkForUpdate();
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});

function checkForUpdate() {
	https.get("https://raw.githubusercontent.com/aljubaer/electron-app-running-background/master/version.json", response => {
		var stream = response.pipe(file);

		stream.on("finish", function () {
			console.log("done");
			// Get content from file
			var contents = fs.readFileSync("./version.json");
			// Define to JSON type
			var jsonContent = JSON.parse(contents);
			let newVersion = jsonContent.version;
			let url = jsonContent.url;
			if (newVersion > currentVersion) {
				console.log('Update available');
				currentVersion = newVersion;
				dialog.showMessageBox(null, options, (response) => {
					console.log(response);
					if (response == 1) {
						opn(url);
					}
				});
			} else {
				console.log('No update');
			}
		});
	});
}