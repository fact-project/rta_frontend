const d3 = require('d3');
const d3_time = require('d3-time');
const d3_ease = require('d3-ease');

// var tooltip = d3.select(parentID).append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0.0);

//add invisible rectangle for tooltip hover
// selectedData.append('rect')
//     .style("fill", "#ffffff")
//     .style("opacity", "0")
//     .attr('x', function(d) {
//         return x(d.date);
//     })
//     .attr('y', function(d) {
//         return y(d.excess) - 0.5 * 50
//     })
//     .attr('width', domainWidth / (numberOfBars + 1))
//     .attr('height', function(d) {
//         return 50;
//     })
//     .on("mouseover", function(d) {
//
//         var x = d3.mouse(this)[0];
//         var y = d3.mouse(this)[1];
//         tooltip.transition()
//             .duration(300)
//             .style("opacity", .9);
//         tooltip.html(
//             "<h1>" + "Excess: " + numeral(d.excess).format('0.00') + "</h1>"
//                 + "Signal: " + (d.signalEvents) + "<br/>"
//                 + "Background: " + (d.backgroundEvents) +"<br/>"
//                 // + "Source: " + (d.source)
//             )
//             .style("left", (x + 50) + "px")
//             .style("top", (y) + "px");
//     })
//     .on("mouseout", function(d) {
//         tooltip.transition()
//             .duration(500)
//             .style("opacity", .0);
//     });

function LightCurve(parentID, lightcurve) {

    var alpha = 0.2;
    var binning = 60;

    var margin = {
            top: 15,
            right: 0,
            bottom: 40,
            left: 40
        },
        width = 650,
        height = 380;


    var bins = lightcurve;
    var startDates = _.map(bins, 'bin_start');
    var endDates = _.map(bins, 'bin_end');

    var excess = _.map(bins, 'excess_rate_per_h')


    var numberOfBars = bins.length;

    var earliestDate = d3.min(startDates);
    var latestDate = d3.max(endDates);

    var maxExcess = d3.max(excess);
    var minExcess = d3.min(excess);


    var x = d3.time.scale()
        .domain([earliestDate, d3.time.minute.offset(latestDate, 60)])
        .rangeRound([0, width - margin.left - margin.right]);

    var y = d3.scale.linear()
        .domain([-2, maxExcess + 4])
        .range([height - margin.top - margin.bottom, 0]);



    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(5)
        .tickFormat(d3.time.format('%d. %b %H:%M '))

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickPadding(8);

    var svg = d3.select(parentID).append('svg')
        .attr('class', 'chart')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');



    //gray background
    svg.append("rect")
        .attr("class", "plot background")
        .attr("width", width - margin.right - margin.left)
        .attr("height", height - margin.top - margin.bottom)
        .attr('transform', 'translate(0, 0)');

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "axis_label")
        .attr("transform", "translate("+ 15 +","+ height/2.0+")rotate(-90)")
        .text("Excess Events per hour");

    //axis objects and label settings
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height - margin.top - margin.bottom) + ')')
        .call(xAxis)


    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    var zeroline = svg.append("line")// attach a line
        .style("stroke", "lightgray") // colour the line
        .style("stroke-width", "0.5px")
        .attr("x1", 0) // x position of the first end of the line
        .attr("y1", height/2.0) // y position of the first end of the line
        .attr("x2", width) // x position of the second end of the line
        .attr("y2", height/2.0); // y position of the second end of the line



    this.update = function draw(data){
      startDates = _.map(data, 'bin_start');
      endDates = _.map(data, 'bin_end');

      excess = _.map(data, 'excess_rate_per_h')

      earliestDate = d3.min(startDates);
      latestDate = d3.max(endDates);

      maxExcess = d3.max(excess);
      minExcess = d3.min(excess);

      x.domain([earliestDate, d3.time.minute.offset(latestDate, binning)])
        .rangeRound([0, width - margin.left - margin.right]);

      y.domain([-2, maxExcess + 4])
        .range([height - margin.top - margin.bottom, 0]);

      zeroline.transition()
              .duration(1500)
              .attr("x1", 0)
              .attr("y1", y(0))
              .attr("x2", width)
              .attr("y2", y(0))


      // update axis
      svg.select('.x.axis')
        .transition()
        .duration(300)
        .call(xAxis)

      // update axis
      svg.select(".y.axis").transition().duration(300).call(yAxis)

      var selectedData = svg.selectAll('.epoint').data(data, function(d) {
       return d.bin_end.toISOString() + ' ' + d.ontime + ' ' + d.excess_rate_per_h;
      })

      selectedData.exit()
            .transition()
            .ease(d3_ease.easeCubicOut)
            .duration(1750)
              .attr('transform', 'translate(0, 160)')
              .style('stroke-opacity', '0')
            .remove()

      selectedData.enter()
            .append('svg:path')
            .attr('class', 'epoint')
            .attr('d', error_point)
            .attr('transform', 'translate(0, -160)')
            .style('stroke-opacity', '0')
          .transition()
          .ease(d3_ease.easeCubicOut)
          .duration(1750)
            .attr('transform', 'translate(0, 0)')
            .style('stroke-opacity', '1')

      // selectedData.transition()
      //     .duration(900)
      //     .style('stroke-width', 1)
      //     .style('stroke', 'red')

      function error_point(d) {
        var width = (x(d.bin_end) - x(d.bin_start))
        var err = y(d.excess_rate_per_h) - y(d.excess_rate_per_h + d.excess_rate_err/2.0)

        var path =  "M" + x(d.bin_start) + "," + y(d.excess_rate_per_h)
             + "h" + width
             + "h" + (-width/2.0)
    	       + "v" + err
             + "v" + (-err*2)
        return path
    	}
    }
}

module.exports = LightCurve;
