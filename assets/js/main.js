/*
	Prism by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

//
const $ = require('zeptojs');
const Hexmap = require('hexmap');
const numeral = require('numeral');
const _ = require('lodash');
const d3 = require('d3');
const LinePlot = require('./systemstatus.js');
const DataRatePlot = require('./datarate.js');
// const LightCurve = require('./lightcurve.js');


//(function($) {
//
//	skel.breakpoints({
//		xlarge:	'(max-width: 1680px)',
//		large:	'(max-width: 1280px)',
//		medium:	'(max-width: 980px)',
//		small:	'(max-width: 736px)',
//		xsmall:	'(max-width: 480px)'
//	});
//
//	$(function() {
//
//		var	$window = $(window),
//			$body = $('body');
//
//		// Disable animations/transitions until the page has loaded.
//			$body.addClass('is-loading');
//
//			$window.on('load', function() {
//				window.setTimeout(function() {
//					$body.removeClass('is-loading');
//				}, 100);
//			});
//
//		// Fix: Placeholder polyfill.
//			$('form').placeholder();
//
//		// Prioritize "important" elements on medium.
//			skel.on('+medium -medium', function() {
//				$.prioritize(
//					'.important\\28 medium\\29',
//					skel.breakpoint('medium').active
//				);
//			});
//
//	});
//
//})(jQuery);

/*
FACT RTA stuff
 */

SECONDS = 1000;
MINUTES = 60*SECONDS;


$(document).ready(init);

function init() {

    var iso = d3.time.format.iso;

    var camera   = new Hexmap('fact_map', 450, 5);
    var memPlot = new LinePlot('#memory_chart', data=[], width=280, height=250, color='red', label='Used Memory in MB');
    var loadPlot = new LinePlot('#load_chart', data=[], width=280, height=250, color='orange', label='Average Load');
    var ratePlot = new DataRatePlot('#datarate_chart', data=[], radius=3);

    function loadSkyCamImage() {
        console.log("loading allskycam iamge");
        $("#allskycam").attr("src", "./images/hex-loader2.gif");
        setTimeout(function () {
            console.log("loading allskycam img inner ");
            d = new Date();
            $("#allskycam").attr("src", "http://www.gtc.iac.es/multimedia/netcam/camaraAllSky.jpg?" + d.getTime());
        }, 4000);
    }


    var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/rta");
    webSocket.onmessage = function (msg) {
        console.log(msg);
        var data = JSON.parse(msg.data);

        if (data.topic === "RUN_INFO"){
            console.log("updating teh run ");
            // update_run_info(data);
        }

        if (data.topic === "DATA_RATE"){
            data.date = iso.parse(data.date);
            data.timestamp = iso.parse(data.timestamp);
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
            camera.update(data.photonCharges);
            $('#source_name').html(data.sourceName);
            $('#eventTimeStamp').html(data.eventTimeStamp);
            $('#size').html(numeral(data.size).format('0.00'));
            $('#energy').html(numeral(data.estimatedEnergy).format('0.00') + " GeV");
            $('#theta_square').html(numeral(data.thetaSquare).format('0.000'));
        }
    };


    // function loadEvent() {
    //     console.log("loading Event");
    //
    //     $.getJSON('/event', function (latestEvent) {
    //         if (latestEvent) {
    //             camera.update(latestEvent.photonCharges, duration = 2.0);
    //             $('#source_name').html(latestEvent.sourceName);
    //             $('#eventTimeStamp').html(latestEvent.eventTimeStamp);
    //             $('#size').html(numeral(latestEvent.size).format('0.00'));
    //             $('#energy').html(numeral(latestEvent.estimatedEnergy).format('0.00'));
    //             $('#theta_square').html(numeral(latestEvent.thetaSquare).format('0.000'));
    //         }
    //     });
    // }
    //
    //
    // function loadMachineStatus() {
    //     console.log("loading Machine Status");
    //
    //     $.getJSON('/status', function (status) {
    //         if (status) {
    //             console.log(status);
    //             // bullet.update(status.photonCharges, duration = 2.0);
    //             $('#space').html(numeral(status.freeSpace / (1024*1024*1024)).format('0.00'));
    //             $('#memory').html(numeral(status.usedMemory/ (1024*1024)).format('0.00'));
    //             $('#cpus').html(numeral(status.availableProcessors).format('0'));
    //         }
    //     });
    // }


    // var binning = 20;
    //
    // $.getJSON('/lightcurve', function (lightcurve) {
    //     if (lightcurve != null ) {
    //         console.log(lightcurve)
    //     }
    // });
    //
    //
    // $.getJSON('/lightcurve', function (lc) {
    //     if(lc){
    //         lc.bins = _.map(lc.bins, function(b){
    //             b.endTime = iso.parse(b.endTime);
    //             b.startTime= iso.parse(b.startTime);
    //             b.lower = b.excess - Math.sqrt(b.excess) * 0.5;
    //             b.upper = b.excess + Math.sqrt(b.excess) * 0.5;
    //             return b
    //         });
    //         var l = new LightCurve('#lightcurve', lc);
    //     }
    // });



    // var latestTimeStamp;
    // window.setInterval(function(){
    //     if (ratePlot){
    //         var query = '/datarate';
    //         if(latestTimeStamp){
    //             query = '/datarate?timestamp='+iso(latestTimeStamp);
    //         }
    //         $.getJSON(query, function (rates) {
    //             if (rates != null) {
    //
    //                 rates = _.map(rates, function(a){
    //                     a.date = iso.parse(a.date);
    //                     return a;
    //                 });
    //                 latestTimeStamp = _.maxBy(rates, 'date').date;
    //                 console.log(latestTimeStamp);
    //                 ratePlot.update(rates);
    //             }
    //         });
    //     }
    // }, 10*SECONDS);
    //
    //
    // loadSkyCamImage();
    // window.setInterval(loadSkyCamImage, 5*MINUTES);
    //
    // loadEvent();
    // window.setInterval(loadEvent, 7*SECONDS);
    //
    //
    // window.setInterval(loadMachineStatus, 30*SECONDS);
}

