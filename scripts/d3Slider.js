// d3Slider.js
require('./base.css');

//var d3 = require('d3');
var d3Slider = {};

d3Slider.create = function(el, state) {
  var svg = d3.select(el).append('svg')
    .attr('class', 'd3').attr('height', 0);
  this.update(el, state);
};

d3Slider.update = function(el, state) {
  this._drawSlider(el, state.min, state.max, state.onSlideFn, state.startValue, state.statsAvg, state.isOnlyDisplayingStaticStats);
};

d3Slider.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};

/* Normalizes stats to be out of 100 */
d3Slider._drawSlider = function(el, min, max, onSlideFn, startValue, statsAvg, isOnlyDisplayingStaticStats) {

  var margin = {top: 40, right: 40, bottom: 20, left: 20},
    width = el.offsetWidth - margin.left - margin.right,
    height = 90 - margin.bottom - margin.top;

  var x = d3.scale.linear()
      .domain([min, max])
      .range([0, width])
      .clamp(true);

  var brush = d3.svg.brush()
      .x(x)
      .extent([0, 0])
      .on("brush", brushed);

  if(!statsAvg || isOnlyDisplayingStaticStats) {
  var svg = d3.select(el).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d) { return d; })
        .tickSize(0)
        .tickPadding(12))
    .select(".domain")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "halo")

  var slider = svg.append("g")
      .classed("slider", true)
      .attr("class", "slider")
      .call(brush);

  slider.selectAll(".extent,.resize")
      .remove();

  slider.select(".background")
      .attr("height", height);

  // Draw a handle if startValue is given
  if(startValue >= 0) { 
    var handle = slider.append("circle")
        .attr("class", "handle")
        .attr("transform", "translate(0," + height / 2 + ")")
        .attr("r", 9);
  }
  slider
    .call(brush.event)
  .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([startValue, startValue]))
    .call(brush.event);

    function brushed() {
      // If the slider is showing the stats avg too, disable sliding capability
      if(!statsAvg) {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
          value = Math.round(x.invert(d3.mouse(this)[0]));
          brush.extent([value, value]);
        }
        if(startValue >= 0) handle.attr("cx", x(value));
        onSlideFn(value);
      }
    }
  } 
  
  if(statsAvg) {
    var svg = d3.select(el).selectAll("svg");
    var slider = svg.selectAll("g .slider");
    /* Initialize tooltip */
    var tip = d3.tip().html("Average: " + Math.round(statsAvg* 100) / 100) // Round to 2 decimal places
    .offset([-10, 0]);

    /* Invoke the tip in the context of slider */
    slider.call(tip);
    slider.append("circle")
      .attr("class", "averageCircle")
      .attr("transform", "translate(" + x(statsAvg) + "," + height/2 + ")")
      .attr("r", 0.5)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
       .transition()
        .duration(500)
      .attr("r", 9);
  }
};

module.exports = d3Slider;