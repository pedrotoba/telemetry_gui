
const ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;

console.log("IPC RENDERER")

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    if(remote.getGlobal('sharedObj').port != null){
    	document.getElementById("con_status").className = "label label-success"
      document.getElementById("con_status").textContent = "Connected"
    }else{
    	document.getElementById("con_status").className = "label label-danger"
      	document.getElementById("con_status").textContent = "Disconnected"
    }
});

ipc.on('con_status', function(event, message) {
      console.log(message);
      if(message=="connected"){
      	document.getElementById("con_status").className = "label label-success"
      	document.getElementById("con_status").textContent = "Connected"
      }
      if(message=="disconnected"){
      	document.getElementById("con_status").className = "label label-danger"
      	document.getElementById("con_status").textContent = "Disconnected"
      }  
});

ipc.on('cam_con_status', function(event, message) {
      console.log(message);
      if(message=="connected"){
        document.getElementById("cam_con_status").className = "label label-success"
        document.getElementById("cam_con_status").textContent = "Connected"
      }
      if(message=="disconnected"){
        document.getElementById("cam_con_status").className = "label label-danger"
        document.getElementById("cam_con_status").textContent = "Disconnected"
      }  
});

function select_port(port){
	console.log(port)
	ipc.send('port',port) 
}

function get_global(){
  ipc.send('reply',"");
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