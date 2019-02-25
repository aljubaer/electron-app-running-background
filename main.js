// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

var iconpath = './icon.png';

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 600, height: 600, icon: iconpath })

  win.loadFile('index.html');

  var appIcon = new Tray(iconpath)

  var contextMenu = Menu.buildFromTemplate([
      {
          label: 'Show App', click: function () {
              win.show()
          }
      },
      {
          label: 'Quit', click: function () {
              app.isQuiting = true
              app.quit();
          }
      }
  ])

  appIcon.setContextMenu(contextMenu)

  win.on('close', function (event) {
    if (!app.isQuiting){
      event.preventDefault();
      win.hide();
    }
    return false;   
  })

  win.on('minimize', function (event) {
      event.preventDefault()
      win.hide()
  })

  win.on('show', function () {
      appIcon.setHighlightMode('always')
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   // On macOS it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
