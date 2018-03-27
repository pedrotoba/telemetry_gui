const ipc_index = require('electron').ipcRenderer;
var remote = require('electron').remote;    

console.log("Telemetry process")

//const serialport = require("serialport");

remote.getGlobal('sharedObj').camera_port

var videoElement;

document.addEventListener("DOMContentLoaded", function(event) {
		navigator.mediaDevices.enumerateDevices().then(get_camera_devices);
        videoElement = document.querySelector('video');
});


function get_camera_devices(devices) {
  for (var i = 0; i !== devices.length; ++i) {
    var device = devices[i];
    if (device.kind === 'audioinput') {
    	console.log("Audio Device found" + device.label)
    } else if (device.kind === 'videoinput') {
    	console.log("Video Device found" + device.label)
    	el = document.createElement('li');
    	el.innerHTML = '<a onclick="select_camera(\''+device.deviceId+'\')" href="#">'+device.label+'</a>';
    	document.getElementById("devices_list").appendChild(el);
    } else {
      console.log('Found one other kind of source/device: ', device);
    }
  }
}

function select_camera(cam_port){
	var constraints = {
	    video: {
	      deviceId: {exact: cam_port}
	    }
 	};
 	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}


//var SerialPort = serialport.SerialPort; 

/*var serialPort = new SerialPort("/dev/cu.usbmodem14131", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});*/

