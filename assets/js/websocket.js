//Establish the WebSocket connection and set up event handlers

var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/rta");
webSocket.onmessage = function (msg) {
    console.log(msg);
    var data = JSON.parse(msg.data);

    if (data.topic === "RUN_INFO"){
        console.log("updating teh run ");
        update_run_info(data);
    }

    if (data.topic === "DATA_RATE"){
        console.log("updating teh data rate ");
        update_datarate(data);
    }

    if (data.topic === "STATUS"){
        console.log("updating teh status");
        update_status(data);
    }


    if (data.topic === "EVENT"){
        console.log("updating teh status");
        update_status(data);
    }
};


function update_status(status) {
    console.log(status);
    // insert("rates", "<li>" + data_rate.rate+ "</li>");
}


function update_datarate(data_rate) {
    console.log(data_rate);
    insert("rates", "<li>" + data_rate.rate+ "</li>");
}


function update_run_info(run) {
    console.log(run);
    insert("runs", "<li>" + run.runID + " : " + run.night + "</li>");
}


//Helper function for inserting HTML as the first child of an element
function insert(targetId, message) {
    id(targetId).insertAdjacentHTML("afterbegin", message);
}

//Helper function for selecting element by id
function id(id) {
    return document.getElementById(id);
}
