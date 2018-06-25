const ipc_status = require('electron').ipcRenderer;
var remote = require('electron').remote;    

console.log("Status process")

ipc_status.on('serial_data', function(event, message) {
	message = message.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
    console.log(message);
    update_dom(message);
});

//P:-1.370165,R:0.318384*1
//T:22.835880,S:0.000000*15

function update_dom(data){

	var aux= data.split("*");
	var data = aux[0];
	var checksum = aux.splice(-1)[0];

	if(check_data(data,checksum)){
		data_var = data.split(",");
		data_var.forEach(function(element){
			//console.log("Element: " + element[0])
			var token = element.split(":");
			if(token[0] == 'P') document.getElementById("rotation_y").innerHTML = token[1]; //GYRO Y
			if(token[0] == 'R') document.getElementById("rotation_x").innerHTML = token[1]; //GYRO X
			if(token[0] == 'T') document.getElementById("gyro_temperature").innerHTML = token[1]; //GYRO X
			if(token[0] == 'S') document.getElementById("speed").innerHTML = token[1];
			if(token[0] == 'D') document.getElementById("date").innerHTML = token[1]; 
			if(token[0] == 'Ti') document.getElementById("time").innerHTML = token[1]; 
			if(token[0] == 'La') document.getElementById("latitude").innerHTML = token[1];
			if(token[0] == 'Lo') document.getElementById("longitude").innerHTML = token[1];
			if(token[0] == 'Pr') document.getElementById("pressure").innerHTML = token[1];
		});
	}

}