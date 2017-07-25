/*
  FACT RTA Frontend 2017

  written by K.Bruegge. He knows nothing of JavaScript. But thats okay.

*/
const $ = require('zeptojs');
const Hexmap = require('hexmap');
const numeral = require('numeral');
const _ = require('lodash');
const d3 = require('d3');
const LinePlot = require('./lineplot.js');
const DataRatePlot = require('./datarate.js');
const LightCurvePlot = require('./lightcurve.js');

SECONDS = 1000;
MINUTES = 60*SECONDS;

var RTA_ADDRESS = "161.72.93.138:4567"


$(document).ready(init);

function init() {

    var iso = d3.time.format.iso;
    var utc = d3.time.format.utc;

    var camera   = new Hexmap('fact_map', 450, 5);
    var memPlot = new LinePlot('#memory_chart', data=[], width=300, height=260, color='red', label='Used Memory in MB');
    var loadPlot = new LinePlot('#load_chart', data=[], width=300, height=260, color='orange', label='Average Load');
    var ratePlot = new DataRatePlot('#datarate_chart', data=[], radius=3);
    var excessPlot = new LightCurvePlot('#lightcurve', data=[])

    console.log('Starting RTA frontend on ' + location.host)
    console.log('Connecting websockets to ' + location.hostname + ':4567')
    var webSocket = new WebSocket("ws://" + location.hostname + ":4567/rta");

    function loadSkyCamImage() {
        $("#allskycam").attr("src", "./static/images/hex-loader2.gif");
        setTimeout(function () {
            console.log("loading allskycam img inner ");
            d = new Date();
            $("#allskycam").attr("src", "http://www.gtc.iac.es/multimedia/netcam/camaraAllSky.jpg?" + d.getTime());
        }, 4000);
    }

    function get_excess() {
      $.getJSON( "/v1/excess?bin_width=60", function(data) {
        //parse date strings to datetime objects
        console.log(data)
	_.map(data, function (d){
          d.bin_start = iso.parse(d.bin_start)
          d.bin_end = iso.parse(d.bin_end)
          return d
        })
	console.log(data)
        excessPlot.update(data)
      })
    }

    function check_rta_status(){
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

        // if (data.topic === "RUN_INFO"){
        //     console.log("updating teh run ");
        //     // update_run_info(data);
        // }

        if (data.topic === "DATA_RATE"){
            data.date = iso.parse(data.date);
            data.timestamp = iso.parse(data.timestamp);
            $('#datarate').html(numeral(data.rate).format('0.0'));
            ratePlot.update(data);
        }

        if (data.topic === "DATA_STATUS"){
            console.log("updating data_status field")
            $('#datastatus').html(data.status);
        }

        if (data.topic === "MACHINE_STATUS"){
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
	    console.log(data)
            camera.update(data.photonCharges, duration=500);
            $('#source_name').html(data.sourceName);
            $('#event_timestamp').html(iso.parse(data.dateString));
            $('#size').html(numeral(data.size).format('0.00'));
            $('#energy').html(numeral(data.estimatedEnergy).format('0.00') + " GeV");
            $('#theta_square').html(numeral(data.thetaSquare).format('0.00'));
        }
    };



    loadSkyCamImage();
    window.setInterval(loadSkyCamImage, 5*MINUTES);

    setTimeout(check_rta_status, 2000)
    window.setInterval(check_rta_status, 1*MINUTES);

    get_excess()
    window.setInterval(get_excess, 5*MINUTES);
}
