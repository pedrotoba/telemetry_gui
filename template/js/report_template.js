var electron = require('electron');
const ipc_report_template = require('electron').ipcRenderer;
var currentWindow = electron.remote.getCurrentWindow();
 
console.log(currentWindow.webContents.browserWindowOptions.gps_list);

var gps_list = currentWindow.webContents.browserWindowOptions.gps_list;
var gyro_list = currentWindow.webContents.browserWindowOptions.gyro_list;

var id = currentWindow.webContents.browserWindowOptions.id_value;
console.log(id);
document.addEventListener("DOMContentLoaded", function(event) {
	var av_speed;
	var av_temp;
	var av_height;
	var av_pressure;
	var i = 0;
	var j = 0;
	gps_list.forEach(function(element){
		console.log(element)
		av_speed = av_speed + element["Speed"]
		if(element["Latitude"] != '-' && element["Latitude"] != 0.0) Latitude = element["Latitude"];
		if(element["Longitude"] != '-' && element["Longitude"] != 0.0) Longitude = element["Longitude"];
		if(element["GPS_time"] != '-' && element["GPS_time"] != 0.0) GMT_time = parse_gps_time(String(element["GPS_time"]));
		date = element["GPS_date"]
		i = i + 1;
	});

	av_speed = av_speed / i;
	//av_speed = 0.0;
	gyro_list.forEach(function(element){
		av_temp = av_temp + element["Temperature"]
		av_pressure = av_pressure + element["Pressure"]
		j = j + 1;
	});

	av_pressure = av_pressure / j;

	av_pressure = av_pressure/100;
	altitude = 44330 * (1.0 - pow(av_pressure / 1013.25 0.1903));
	//altitude = 0;
	document.getElementById("id_l").innerHTML = "Launch #" + id;
	document.getElementById("local_time").innerHTML = "Local Time: " + get_local_time();
	console.log("GMTTIME" + GMT_time);
	document.getElementById("GMT_time").innerHTML = "GMT Hour: 18:22:15";
	document.getElementById("date").innerHTML = "Date: " + get_local_date();
	document.getElementById("av_speed").innerHTML = "Average speed: " + av_speed;
	document.getElementById("av_temp").innerHTML = "Average temperature: 24.3 C";
	document.getElementById("av_height").innerHTML = "Max height: " + altitude;
	document.getElementById("last_position").innerHTML = "Last position: " + Latitude + "," + Longitude;

	add_marker_map(Latitude,Longitude);

  	ipc_report_template.send('print_to_pdf',id);
});

function add_marker_map(lat,long){
  var new_marker = new google.maps.Marker({map: map,position: new google.maps.LatLng(lat, long)});
  var center = new google.maps.LatLng(lat, long);
  new_marker.setMap(map);
  map.panTo(center);
  marker = new_marker;
}

function get_local_time(){
  var currentdate = new Date(); 
  var datetime = currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
  return datetime;
}

function get_local_date(){
  var currentdate = new Date(); 
  var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear()
  return datetime;
}

function parse_gps_time(time){
	var result_time = "";
	var i;

	hour  = time.slice(0,2)
	min = time.slice(2,4)
	seg = time.slice(4,6)

	result_time = hour + ":" + min + ":" + seg;
	return result_time;
}