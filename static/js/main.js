/*
	Prism by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

const $ = require('zeptojs');
const Hexmap = require('hexmap');
const numeral = require('numeral');
const _ = require('lodash');
const d3 = require('d3');
const LinePlot = require('./lineplot.js');
const DataRatePlot = require('./datarate.js');


/*
 * FACT RTA stuff
 */

SECONDS = 1000;
MINUTES = 60*SECONDS;

var RTA_ADDRESS = "localhost:4567"


$(document).ready(init);

function init() {

    var iso = d3.time.format.iso;
    var utc = d3.time.format.utc;

    var camera   = new Hexmap('fact_map', 450, 5);
    var memPlot = new LinePlot('#memory_chart', data=[], width=280, height=250, color='red', label='Used Memory in MB');
    var loadPlot = new LinePlot('#load_chart', data=[], width=280, height=250, color='orange', label='Average Load');
    var ratePlot = new DataRatePlot('#datarate_chart', data=[], radius=3);
    var webSocket = new WebSocket("ws://" + RTA_ADDRESS + "/rta");

    function loadSkyCamImage() {
        console.log("loading allskycam iamge");
        $("#allskycam").attr("src", "./static/images/hex-loader2.gif");
        setTimeout(function () {
            console.log("loading allskycam img inner ");
            d = new Date();
            $("#allskycam").attr("src", "http://www.gtc.iac.es/multimedia/netcam/camaraAllSky.jpg?" + d.getTime());
        }, 4000);
    }

    function check_rta_status(){
      console.log("checking for rta status")
      if (webSocket.readyState == webSocket.CLOSED){
        $('#status_display').html("RTA is currently offline");
        $('#status_display').attr("class", "offline");
      }
      if (webSocket.readyState == webSocket.OPEN || webSocket.readyState == webSocket.OPENING){
        $('#status_display').html("RTA is Running");
        $('#status_display').attr("class", "online");
      }
    }


    webSocket.onmessage = function (msg) {
        var data = JSON.parse(msg.data);

        if (data.topic === "RUN_INFO"){
            console.log("updating teh run ");
            // update_run_info(data);
        }

        if (data.topic === "DATA_RATE"){
            data.date = iso.parse(data.date);
            data.timestamp = iso.parse(data.timestamp);
            $('#datarate').html(numeral(data.rate).format('0.0'));
            ratePlot.update(data);
        }

        if (data.topic === "STATUS"){
            console.log("updating teh status");
            data.date = iso.parse(data.timestamp);
            data.timestamp = iso.parse(data.timestamp);

            $('#space').html(numeral(data.freeSpace / (1024*1024*1024)).format('0.00'));
            $('#memory').html(numeral(data.usedMemory/ (1024*1024)).format('0.00'));
            $('#cpus').html(numeral(data.availableProcessors).format('0'));

            data.value = data.usedMemory/ (1024*1024);
            memPlot.update(data);

            //do a shallow clone
            var copy = Object.assign({}, data);
            copy.value = data.loadAverage;
            loadPlot.update(copy);
        }


        if (data.topic === "EVENT"){
            camera.update(data.photonCharges, duration=500);
            $('#source_name').html(data.sourceName);
            $('#event_timestamp').html(iso.parse(data.eventTimeStamp).toUTCString().replace("GMT", "UTC"));
            $('#size').html(numeral(data.size).format('0.00'));
            $('#energy').html(numeral(data.estimatedEnergy).format('0.00') + " GeV");
            $('#theta_square').html(numeral(data.thetaSquare).format('0.00'));
        }
    };



    loadSkyCamImage();
    window.setInterval(loadSkyCamImage, 5*MINUTES);

    setTimeout(check_rta_status, 2000)
    window.setInterval(check_rta_status, 1*MINUTES);

}
