const d3 = require('d3');
const _ = require('lodash');

function LinePlot(parentID, data, width=400, height=400, color="steelblue", label="y-label"){
    // Set the dimensions of the canvas / graph
    var margin = {top: 0, right:0, bottom: 30, left: 40}

    // Set the ranges
    var x = d3.time.scale().range([0, width - margin.left - margin.right]);
    var y = d3.scale.linear().range([height - margin.top - margin.bottom, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom")
        .ticks(4)
        .tickFormat(d3.time.format("%H:%M:%S"));

    var yAxis = d3.svg.axis().scale(y)
        .orient("left")
        .ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.value);
        });

        var y = d3.scale.linear()
            .domain([0, 100])
            .range([height - margin.top - margin.bottom, 0]);


    // Scale the range of the data
    x.domain([0, 10]);
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    // Adds the svg canvas
    var svg = d3.select(parentID).append('div')
        .classed("svg-container", true) //container class to make it responsive
      .append('svg')
        .attr('class', 'chart')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-content-responsive", true)
      .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // add gray background
    svg.append("rect")
        .attr("class", "plot background")
        .attr("width", width - margin.right - margin.left)
        .attr("height", height - margin.top - margin.bottom)
        .attr('transform', 'translate(0, 0)');


    // Add the valueline path.
    svg.append("path")
        .style("stroke", color)
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
        .call(xAxis)

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // add an axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class", "axis_label")
        .attr("transform", "translate("+ 15 +","+ height*0.5 +")rotate(-90)")
        .text(label);

    this.update = function updateDataRatePlot(newData) {
        var limit = 100;
        if (data.length > limit){
            data  = _.drop(data, newData.length);
        }
        data = _.concat(data, newData);

        // Scale the range of the data again
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        // Make the changes
        svg.select(parentID + " .line")
            .transition()
            .duration(750)
            .attr("d", valueline(data))
            .style("stroke", color);
        svg.select(".x.axis")
            .transition()
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis")
            .transition()
            .duration(750)
            .call(yAxis);

    }


}

module.exports = LinePlot;
