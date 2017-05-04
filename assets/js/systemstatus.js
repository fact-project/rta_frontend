const d3 = require('d3');
const _ = require('lodash');

function LinePlot(parentID, data, width=600, height=320, color="steelblue", label="y-label"){
// Set the dimensions of the canvas / graph
    var margin = {top: 20, right: 5, bottom: 20, left: 30},
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;


    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

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


    // Scale the range of the data
    x.domain([0, 10]);
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    // Adds the svg canvas
    var svg = d3.select(parentID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // add gray background
    svg.append("rect")
        .style("fill", "#f8f8f8")
        .attr("width", width)
        .attr("height", height)
        .attr('transform', 'translate(0, 0)');


    // Add the valueline path.
    svg.append("path")
        .style("stroke", color)
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.select(".x.axis")
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-40)");

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

        // // Select the section we want to apply our changes to
        // var svg = d3.select("body").transition();

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

//
// function LinePlot(parentID, data, duration=900, width=600, height=400, color="steelblue"){
//
//     this.data = data;
//     var margin = {
//             top: 40,
//             right: 40,
//             bottom: 40,
//             left: 40
//         };
//
//     var dates = _.map(data, 'date');
//     var earliestDate = d3.min(dates);
//     var latestDate = d3.max(dates);
//
//     var x_scale = d3.time.scale()
//         .domain([earliestDate, latestDate])
//         .rangeRound([0, width - margin.left - margin.right]);
//
//     var x_axis = d3.svg.axis()
//         .scale(x_scale)
//         .orient('bottom')
//         .tickFormat(d3.time.format("%H:%M:%S"));
//
//
//     var y_scale = d3.scale.linear()
//         .domain([0, 100])
//         .range([height - margin.top - margin.bottom, 0]);
//
//     var y_axis= d3.svg.axis()
//         .scale(y_scale)
//         .orient('left')
//         .ticks(5);
//
//     var svg = d3.select(parentID).append('svg')
//         .attr('class', 'chart')
//         .attr('width', width)
//         .attr('height', height)
//         .append('g')
//         .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
//
//     svg.append("text")
//         .attr("text-anchor", "middle")
//         .attr("class", "axis_label")
//         .attr("transform", "translate("+ 15 +","+ y_scale(50)+")rotate(-90)")
//         .text("Memory Usage in GigaBytes");
//
//     svg.append('g')
//         .attr('class', 'x axis')
//         .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
//         .call(x_axis)
//         .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-.8em")
//         .attr("dy", ".15em")
//         .attr("transform", "rotate(-40)");
//
//
//     svg.append('g')
//         .attr('class', 'y axis')
//         .call(y_axis);
//     var valueline = d3.svg.line()
//         .x(function(d){
//             return x_scale(d.date);
//         })
//         .y(function(d){
//             return y_scale(d.value);
//         });
//
//     svg.append("path")
//         .attr("class", "line")
//         .style("stroke", "red")
//         .attr("d", valueline(data));
//
//
//     svg.select(".y.axis")
//         .transition()
//         .duration(duration)
//         .call(y_axis);
//
//     svg.select(".x.axis")
//         .transition()
//         .duration(duration)
//         .call(x_axis);
//
//     svg.select(".x.axis")
//         .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-.8em")
//         .attr("dy", ".15em")
//         .attr("transform", "rotate(-40)");
//
//     this.update = function updateDataRatePlot(newData, limit=100){
//         if (data.length > limit){
//             data  = _.drop(data, newData.length);
//         }
//         data = _.concat(data, newData);
//
//         var dates = _.map(data, 'date');
//         var earliestDate = d3.min(dates);
//         var latestDate = d3.max(dates);
//         x_scale.domain([earliestDate, latestDate]);
//         y_scale.domain([0, _.max(_.map(data, "value"))]);
//
//         svg.select(".x.axis")
//             .transition()
//             .duration(duration)
//             .call(x_axis);
//
//         svg.select(".y.axis")
//             .transition()
//             .duration(duration)
//             .call(y_axis);
//
//         svg.select(".x.axis")
//             .selectAll("text")
//             .style("text-anchor", "end")
//             .attr("dx", "-.8em")
//             .attr("dy", ".15em")
//             .attr("transform", "rotate(-40)");
//
//         svg.select(".line")
//             .transition()
//             .duration(750)
//             .attr("d", valueline(data));
//     }
// }

module.exports = LinePlot;
