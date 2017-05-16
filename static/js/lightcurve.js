const d3 = require('d3');
const d3_time = require('d3-time');



function LightCurve(parentID, lightcurve) {

    var bins = lightcurve;
    var alpha = 0.2;
    var binning = 5;

    var startDates = _.map(bins, 'bin_start');
    var endDates = _.map(bins, 'bin_end');

    var excess = _.map(bins, 'excess_rate_per_h')


    var numberOfBars = bins.length;
    var margin = {
            top: 15,
            right: 0,
            bottom: 40,
            left: 40
        },
        width = 650,
        height = 380;


    var domainWidth = width - margin.left - margin.right;

    var barWidth = domainWidth / (numberOfBars + 1);
    var barHeight = 2;

    var errorBarHeight = 0.5;
    var errorBarWidth = barWidth * 0.66;

    var earliestDate = d3.min(startDates);
    var latestDate = d3.max(endDates);

    var maxExcess = d3.max(excess);
    var minExcess = d3.min(excess);


    //console.log(_.map(data,'lower'))

    var x = d3.time.scale()
        .domain([earliestDate, d3.time.minute.offset(latestDate, binning)])
        .rangeRound([0, width - margin.left - margin.right]);

    var y = d3.scale.linear()
        .domain([minExcess - 4, maxExcess + 4])
        .range([height - margin.top - margin.bottom, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .tickValues(startDates)
        .tickFormat(d3.time.format('%H:%M:%S'))
        .tickSize(6)
        .tickPadding(5);

    // var tooltip = d3.select(parentID).append("div")
    //     .attr("class", "tooltip")
    //     .style("opacity", 0.0);

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
        .attr("transform", "translate("+ 15 +","+ y(maxExcess*0.5)+")rotate(-90)")
        .text("Excess Events per hour");

    var selectedData = svg.selectAll('.chart')
        .data(bins).enter();

    selectedData.append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
            return x(d.bin_start);
        })
        .attr('y', function(d) {
            return y(d.excess_rate_per_h) - 0.5 * barHeight
        })
        .attr('width', function(d){
            return x(d.bin_end) - x(d.bin_start)
        })
        .attr('height', barHeight);

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
    //errorbars
    selectedData.append('rect')
        .attr('class', 'error')
        .attr('x', function(d) {
            var barWidth = (x(d.bin_end) - x(d.bin_start));
            var errorBarWidth = barWidth*0.6;
            return x(d.bin_start) + (barWidth - errorBarWidth) / 2;
        })
        .attr('y', function(d) {
            return y(d.excess_rate_per_h - d.excess_rate_err) - 0.5 * barHeight
        })
        .attr('width', function(d){
            return (x(d.bin_end) - x(d.bin_start))*0.6;
        })
        .attr('height', errorBarHeight);

    selectedData.append('rect')
        .attr('class', 'error')
        .attr('x', function(d) {
            var barWidth = (x(d.bin_end) - x(d.bin_start));
            var errorBarWidth = barWidth*0.6;
            return x(d.bin_start) + (barWidth - errorBarWidth) / 2;
        })
        .attr('y', function(d) {
            return y(d.excess_rate_per_h + d.excess_rate_err) - 0.5 * barHeight
        })
        .attr('width', function(d){
            var barWidth = (x(d.bin_end) - x(d.bin_start));
            var errorBarWidth = barWidth*0.6;
            return errorBarWidth
        })
        .attr('height', errorBarHeight);

    selectedData.append('line')
        .attr('class', 'error')
        .attr('x1', function(d) {
            var barWidth = (x(d.bin_end) - x(d.bin_start));
            return x(d.bin_start) + barWidth / 2;
        })
        .attr('y1', function(d) {
            return y(d.excess_rate_per_h + d.excess_rate_err) - 0.5 * barHeight
        })
        .attr('x2', function(d) {
            var barWidth = (x(d.bin_end) - x(d.bin_start));
            return x(d.bin_start) + barWidth / 2;
        })
        .attr('y2', function(d) {
            return y(d.excess_rate_per_h - d.excess_rate_err) - 0.5 * barHeight
        });

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-40)"
        });

    svg.append("line") // attach a line
        .style("stroke", "lightgray") // colour the line
        .style("stroke-width", "0.5px")
        .attr("x1", x(earliestDate)) // x position of the first end of the line
        .attr("y1", y(0)) // y position of the first end of the line
        .attr("x2", x(latestDate) + domainWidth / (numberOfBars + 1)) // x position of the second end of the line
        .attr("y2", y(0)); // y position of the second end of the line

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
}

module.exports = LightCurve;
