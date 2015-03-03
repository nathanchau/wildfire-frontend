// d3PieChart.js
var d3 = require('d3');
var d3PieChart = {};

d3PieChart.create = function(el, props, state) {
  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', props.width)
      .attr('height', props.height);

  svg.append('g')
      .attr('class', 'd3-bars');

  this.update(el, state);
};

d3PieChart.update = function(el, state) {
  // Re-compute the scales, and render the data Pies
  var scales = this._scales(el, state.data, state.domain);
  this._drawSlices(el, state.data, scales);
};

d3PieChart.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};

d3PieChart._scales = function(el, data, domain) {
  if (!domain) {
    return null;
  }

  var bands = data.map(function(d,i) { return i; });

  var width = el.offsetWidth;
  var height = el.offsetHeight;

  var x = d3.scale.linear()
    .range([0, width])
    .domain(domain.x);

  var y = d3.scale.ordinal()
      .domain(bands)
      .range([0, height]);

  var z = d3.scale.linear()
    .range([5, 20])
    .domain([1, 10]);

  return {x: x, y: y, z: z};
};

d3PieChart._drawSlices = function(selector, data, scales) {
  var margin = {top: 20, right: 20, bottom: 20, left: 20};
  width = 400 - margin.left - margin.right;
  height = width - margin.top - margin.bottom;

  var chart = d3.select("body")
          .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
           .append("g")
            .attr("transform", "translate(" + ((width/2)+margin.left) + "," + ((height/2)+margin.top) + ")");


  var radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
    .range(["#3399FF", "#5DAEF8", "#86C3FA", "#ADD6FB", "#D6EBFD"]);

  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 20);

  var pie = d3.layout.pie()
      .sort(null)
      .startAngle(1.1*Math.PI)
      .endAngle(3.1*Math.PI)
      .value(function(d) { return d.value; });


  var g = chart.selectAll(".arc")
    .data(pie(data))
  .enter().append("g")
    .attr("class", "arc");

  g.append("path")
    .style("fill", function(d) { return color(d.data.name); })
    .transition().delay(function(d, i) { return i * 500; }).duration(500)
    .attrTween('d', function(d) {
         var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
         return function(t) {
             d.endAngle = i(t);
           return arc(d);
         }
    });
  };

module.exports = d3PieChart;