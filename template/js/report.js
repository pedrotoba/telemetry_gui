const ipc_report = require('electron').ipcRenderer;
var remote = require('electron').remote;
const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

var Datastore = require('nedb');

gyro_db = new Datastore({ filename: './db/gyro_db_1', autoload: true });  
gps_db  = new Datastore({ filename: './db/gps_db_1', autoload: true });

var list_gyro;
var f_act;
var f_list = [];
gyro_db.find({ $and: [{"Pitch": {$ne:'-'}}, {"Roll": {$ne:'-'}}] }, function (err, docs) {
  console.log(docs[0]["Pitch"]);
  list_gyro = docs;
  console.log(err);
});

gps_db.find({"date": {$ne:'-'}}, function (err, docs) {
  list = docs;
  var i = 1;
  list.forEach(function(element){
  	console.log("FECHA:" + element["date"])

  	if(!f_list.includes(String(element["date"]))){
  		f_list.push(String(element["date"]))
  	
	  	var button = document.createElement("input")
	  	button.type = "button"
	  	button.value = "Mission #" + i+ " - " +element["date"]; 
	  	button.classList.add("btn")
	  	button.classList.add("btn-danger")
	  	button.classList.add("m-b-10")
	  	button.classList.add("m-l-5")
	  	button.onclick = function(){
	  		open_window(i,String(element["date"]));
	  	}
	  	document.getElementById("list_mission").appendChild(button)
	  	i = i+1;
	  }
  });
});

function open_window(i,date){
	var data_gps_list;
	var data_gyro_list = [];

	gps_db.find({"date": date}, function (err, docs) {
		data_gps_list = docs;
		if(data_gps_list != null){ //&& gyro_gps_list != []){
			const modalPath = path.join('file://', __dirname, 'report_template.html')
			let win = new BrowserWindow({ width: 500, height: 700, id_value:i, gps_list:data_gps_list, gyro_list:data_gyro_list})

			win.on('close', function () { win = null })
			win.loadURL(modalPath)
			win.show()
		}
	})

}