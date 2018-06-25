const ipc_index = require('electron').ipcRenderer;
var remote = require('electron').remote;    
var cont = 0;
console.log("Telemetry process")

//const serialport = require("serialport");

var videoElement;
var camera_port;

document.addEventListener("DOMContentLoaded", function(event) {
  videoElement = document.querySelector('video');
  navigator.mediaDevices.enumerateDevices().then(get_camera_devices).catch(handleError);
  if(remote.getGlobal('sharedObj').camera_port != null){
    select_camera(remote.getGlobal('sharedObj').camera_port);
    document.getElementById("cam_con_status").className = "label label-success";
    document.getElementById("cam_con_status").textContent = "Connected";
  }
  else{
    document.getElementById("cam_con_status").className = "label label-danger";
    document.getElementById("cam_con_status").textContent = "Disconnected";
  }
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
  camera_port = cam_port;
	var constraints = {
	    video: {
	      deviceId: {exact: cam_port},
        width: {exact: 480},
        height: {exact: 250}
	    }
 	};
 	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function gotStream(stream) {
  send_selected_camera(camera_port);
  document.getElementById("no_camera_block").remove()
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}

function send_selected_camera(cam_port){
  ipc.send('cam_port',cam_port);
}

function show_serial_data(){
  console.log(serial_data);
}

ipc_index.on('serial_data', function(event, message) {
    message = message.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
    console.log(message);
    update_dom(message);
});

function update_dom(data){

  var aux= data.split("*");
  var data = aux[0];
  var checksum = aux.splice(-1)[0];
  var latitude ="";
  var longitude ="";

  if(check_data(data,checksum)){
    data_var = data.split(",");
    data_var.forEach(function(element){
      var token = element.split(":");
      if(token[0] == 'P'){
        var pitch_a = document.getElementById("pitch_arrow");
        pitch_a.style.transform="rotate("+element.split(":")[1]+"deg)";
        document.getElementById("pitch_deg").innerHTML = parseInt(element.split(":")[1])+"º";
      } 
      if(token[0] == 'R'){
        var roll_a = document.getElementById("roll_arrow");
        roll_a.style.transform="rotate("+element.split(":")[1]+"deg)"
        document.getElementById("roll_deg").innerHTML = parseInt(element.split(":")[1])+"º";
      }
      if(token[0] == 'T') document.getElementById("gyro_temperature").innerHTML = parseFloat(element.split(":")[1]).toFixed(1);
      if(token[0] == 'La'){
        latitude = element.split(":")[1]
      }
      if(token[0] == 'Lo'){
        longitude = element.split(":")[1]
      }
      if(token[0] == 'D'){
        date_gps = element.split(":")[1]
      }
      if(token[0] == 'Pr'){
        pressure = element.split(":")[1]
      }
      if(token[0] == 'Ti'){
        time_gps = element.split(":")[1]
      }
      if(token[0] == 'S'){

        document.getElementById("speed_box").innerHTML = parseFloat(element.split(":")[1]).toFixed(1);
        if(cont < 10){
          addData(myChart,get_local_time(), parseFloat(element.split(":")[1]));
          cont++;
        }else{
          moveChart(myChart, get_local_time(), parseFloat(element.split(":")[1]));
        }
      }

    });
  }

  if(latitude != "" && longitude != ""){
    add_marker_map(latitude,longitude);
  }

}

function get_local_time(){
  var currentdate = new Date(); 
  var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
  var time = currentdate.getHours() + ":"  + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  //console.log(datetime);
  return time;
}


function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function moveChart(chart, label, newData) {
    chart.data.labels.push(label); // add new label at end
    chart.data.labels.splice(0, 1); // remove first label

    chart.data.datasets.forEach(function(dataset, index) {
        dataset.data.push(newData); // add new data at end
        dataset.data.splice(0, 1); // remove first data point
    });

    chart.update();
}

function add_marker_map(lat,long){
  marker.setMap(null);
  var new_marker = new google.maps.Marker({map: map,position: new google.maps.LatLng(lat, long)});
  var center = new google.maps.LatLng(lat, long);
  new_marker.setMap(map);
  map.panTo(center);
  marker = new_marker;
}

