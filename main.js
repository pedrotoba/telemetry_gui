const electron = require('electron')
// Module to control application life.
const app = electron.app
const ipcMain = electron.ipcMain;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const serialport = require("serialport"); 


global.sharedObj = {port: null,camera_port:null};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let i=0

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1500, height: 900})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'template/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var serial = require('./main_scripts/serial')

ipcMain.on('reply', (event, arg) => {
    console.log(global.sharedObj.port); // prints "ping"
    //event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('port', (event, arg) => {
    //Save the port, and try to connect
    global.sharedObj.port = arg;
    console.log(arg);
    console.log(global.sharedObj.port);
    event.sender.send('con_status', 'connected');
})

function sample_serial(){
  var str = "Lat:0.0;Lon:0.1;Speed:10;Pitch:20;Roll:10;Alt:"+i
  i++
  return str;
}

setInterval(function(){
  var aux = sample_serial();
   mainWindow.webContents.send('serial_data', aux);
},3000);