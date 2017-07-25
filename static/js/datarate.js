const d3 = require('d3');
const _ = require('lodash');

function DataRatePlot(parentID, data, radius=3, duration=900){

    this.data = data;
    var margin = {
            top: 15,
            right: 0,
            bottom: 40,
            left: 40
        },
        width = 650,
        height = 380;

    var dates = _.map(data, 'date');
    var earliestDate = d3.min(dates);
    var latestDate = d3.max(dates);

    var x = d3.time.scale()
        .domain([earliestDate, latestDate])
        .rangeRound([0, width - margin.left - margin.right]);

    var y = d3.scale.linear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);


    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickPadding(8);

    var svg = d3.select(parentID).append('div')
        .classed("svg-container wide", true) //container class to make it responsive
      .append('svg')
        .attr('class', 'chart')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-content-responsive", true)
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
        .attr("transform", "translate("+ 15 +","+ y(50)+")rotate(-90)")
        .text("Events per Second");
    // draw axes

    // draw the x axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format("%H:%M:%S"));

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

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    var circles = svg.selectAll('circle').data(data, function(d) {
        return d.date
    });

    circles.enter()
        .append("circle")
        .attr("r", radius)
        .attr('class', 'plot_dots')
        .attr("cx", function(d) {
            return x(d.date);
        })
        .attr("cy", function(d) {
            return y(d.rate);
        });

    // Update X Axis
    svg.select(".x.axis")
        .transition()
        .duration(duration)
        .call(xAxis);

    svg.select(".x.axis")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-40)"
        });

    this.update = function updateDataRatePlot(newData, limit=100){
        if (data.length > limit){
            data  = _.drop(data, newData.length);
        }
        data = _.concat(data, newData);

        var dates = _.map(data, 'date');
        var earliestDate = d3.min(dates);
        var latestDate = d3.max(dates);
        x.domain([earliestDate, latestDate]);

        svg.select(".x.axis")
            .transition()
            .duration(duration)
            .call(xAxis);

        svg.select(".x.axis")
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-40)";
            });
        var circles = svg.selectAll('circle').data(data, function(d) {
            return d.date;
        });

        circles
            .transition()
            .duration(duration)
            .attr("cx", function(d) {
                return x(d.date);
            })
            .attr("cy", function(d) {
                return y(d.rate);
            });

        circles.enter()
            .append("circle")
            .attr('class', 'plot_dots')
            .attr("r", 0)
            .attr("cx", function(d) {
                return x(d.date);
            })
            .attr("cy", function(d) {
                return y(d.rate);
            })
            .transition()
            .duration(duration)
            .attr("r", radius);

        circles.exit()
            .attr("r", radius)
            .transition()
            .duration(duration)
            .attr("cx", function(d) {
                return x(d.date);
            })
            .attr("cy", function(d) {
                return y(d.rate);
            })
            .attr("r", 0)
            .remove();

    }
}

module.exports = DataRatePlot;
