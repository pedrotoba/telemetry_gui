const electron = require('electron')
// Module to control application life.
const app = electron.app
const ipcMain = electron.ipcMain;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const fs = require('fs')
const os = require('os')

//var jsPDF = require('jspdf');

const serialport = require("serialport"); 
//var SerialPort = serialport.SerialPort;
serialport.list(function(err,ports){
  console.log(JSON.stringify(ports));
})


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
  //mainWindow.webContents.openDevTools()

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
var Datastore = require('nedb') , 
gyro_db = new Datastore({ filename: './db/gyro_db_1', autoload: true });
gps_db  = new Datastore({ filename: './db/gps_db_1', autoload: true });

var serial = require('./main_scripts/serial')

ipcMain.on('reply', (event, arg) => {
    console.log(global.sharedObj);
    //event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('port', (event, arg) => {
    //Save the port, and try to connect
    global.sharedObj.port = arg;
    console.log(arg);
    console.log(global.sharedObj.port);


    var port = new serialport('/dev/ttyUSB0', {
      baudrate: 9600, 
      parser: serialport.parsers.readline('\n')
    });

    port.on('open', function () {
      console.log("Puerto abierto");
      event.sender.send('con_status', 'connected');
    });

    port.on('data', function (data) {
      console.log('Data: ' + data);
      mainWindow.webContents.send('serial_data', data);
      save_db_data(data);
    });

    port.on('closed', function(){
      console.log("DESCONECTADO")
    });
    
})

ipcMain.on('cam_port', (event, arg) => {
    //Save the port, and try to connect
    global.sharedObj.camera_port = arg;
    console.log(arg);
    console.log(global.sharedObj.camera_port);
    event.sender.send('cam_con_status', 'connected');
})

ipcMain.on('get_mission_list', (event, arg) => {
    var list_data;
    gyro_db.find({ $and: [{"Pitch": {$ne:'-'}}, {"Roll": {$ne:'-'}}] }, function (err, docs) {
      //console.log(docs);
      list_data = docs;
      console.log(list_data);
    });

    list_data = JSON.stringify(list_data)
    console.log(list_data);
    //event.sender.send('mission_list', list_data);
    mainWindow.webContents.send('mission_list', list_data);
    //event.returnValue = list_data;
})

ipcMain.on('print_to_pdf', (event,arg) => {

  const pdf_path = path.join(__dirname,"report"+arg+".pdf");

  const win = BrowserWindow.fromWebContents(event.sender);

  win.webContents.printToPDF({},function(error,data){
    if(error) return console.log(error.message);
    fs.writeFile(pdf_path,data,function(err){
      if(err) return console.log(err.message);
    }) 

  })
});

function sample_serial(){
  //var str = '{Lat:0.0,Lon:0.1,Speed:'+i+',Pitch:'+i+',Roll:'+i+',Alt:'+i+'}'
  var str = {Lat:0.0,Lon:0.1,Speed:i,Pitch:i,Roll:i,Alt:i};
  i+=10
  return str;
}

function save_db_data(serial_data){
  var gyro_data_json = {"Pitch":"-","Roll":"-","Temperature":"-"};
  var gps_data_json  = {"GPS_date":"-","GPS_time":"-","Latitude":"-","Longitude":"-"};
  var bmp_data_json  = {};
  current_date = get_local_time();
  gyro_data_json["date"] = current_date;
  gps_data_json["date"] = current_date;
  bmp_data_json["date"] = current_date;

  var aux= serial_data.split("*");
  var data = aux[0];
  var checksum = aux.splice(-1)[0];
  console.log("DATABD: " + data);
  console.log("CHECKBD: " + checksum);

  if(check_data(data,checksum)){
    console.log("Entro para guardar en BD");
    data_var = data.split(",");
    data_var.forEach(function(element){
      var value = element.split(":")[1];
      var token = element.split(":");
      console.log("ELEMENT: " + element);
      if(token[0] == 'P')   gyro_data_json["Pitch"]        = value; //GYRO Y

      if(token[0] == 'R')   gyro_data_json["Roll"]         = value; //GYRO y

      if(token[0] == 'T')   gyro_data_json["Temperature"]  = value; //Temp

      if(token[0] == 'S')   gps_data_json["Speed"]         = value;

      if(token[0] == 'D')   gps_data_json["GPS_date"]      = value;

      if(token[0] == 'Ti')  gps_data_json["GPS_time"]      = value;

      if(token[0] == 'La')  gps_data_json["Latitude"]      = value; 

      if(token[0] == 'Lo')  gps_data_json["Longitude"]     = value; 

      console.log("JSONGYRO: " + JSON.stringify(gyro_data_json));
      console.log("GPSGYRO: " + JSON.stringify(gps_data_json));
    });
    
    //if(valid_json(gyro_data_json)){
      gyro_db.insert(gyro_data_json, function (err, newDoc) {   // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
        console.log("guardado en gyro_data_json");
        console.log(newDoc);
      });
    //}

    //if(valid_json(gps_data_json)){
      gps_db.insert(gps_data_json, function (err, newDoc) {   // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
        console.log("guardado en gps_data_json");
        console.log(newDoc);
      });
    //}
    
  }

}

function valid_json(data_json){
  //console.log(data_json);
  for(var key in data_json){
    if(data_json[key] == '-') return false;
  }
  return true;
}

function check_data(data,checksum){
  var cont = 0;
  for (i = 0; i< data.length; i++){
    cont ^= data.charCodeAt(i);
  }
  cont = cont.toString(16);

  if(cont == checksum) return true;
  else return false;
}

function get_local_time(){
  var currentdate = new Date(); 
  var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear()
  return datetime;
}
