
const ipcMain = require('electron').ipcMain;

ipcMain.on('reply', (event, arg) => {
    console.log(arg)  // prints "ping"
    //event.sender.send('asynchronous-reply', 'pong')
})