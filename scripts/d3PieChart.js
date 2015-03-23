// d3PieChart.js
var d3 = require('d3');
var d3PieChart = {};

var color = d3.scale.ordinal()
    .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

function randomData (){
    var labels = color.domain();
    return labels.map(function(label){
      return { label: label, value: Math.random() }
    });
  };

function change(svg, pie, key, radius, arc, outerArc, data) {

    console.log(data);
    var color = d3.scale.ordinal()
      .domain(function(d) {return d.data.label})
      .range(["#2980b9", "#3498db", "#2ecc71", "#1abc9c", "#27ae60"]);
    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), key);

    var hoverText;

    slice.enter()
      .insert("path")
      .style("fill", function(d) { return color(d.data.label); })
      .attr("class", "slice");
      /*.on("mouseenter", function(d) {
        //console.log("mousein")
        hoverText = slice.append("text")
            .attr("transform", slice.centroid(d))
            .attr("dy", ".5em")
            .style("text-anchor", "middle")
            .style("fill", "blue")
            .attr("class", "on")
            .text(d.data.label);
      })

      .on("mouseout", function(d) {
               hoverText.remove();
      });*/

    slice   
      .transition().duration(1000)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      })

    slice.exit()
      .remove();

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
      .data(pie(data), key);

    text.enter()
      .append("text")
      .attr("font-size", "10px")
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data.label;
      })
      .call(wrap, 110);
    
    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
      .attrTween("transform", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
        };
      })
      .styleTween("text-anchor", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      });

    text.exit()
      .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);
    
    polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };      
      });
    
    polyline.exit()
      .remove();
  };

d3PieChart.create = function(el, state) {
  /*var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
  svg.append('g')
      .attr('class', 'd3-bars');*/

  this.update(el, state);
};

d3PieChart.update = function(el, state) {
  // Render the data Pies
  this._drawSlices(el, state.data);
};

d3PieChart.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};

d3PieChart._drawSlices = function(el, data) {
  var svg = d3.select(el)
  .append("svg")
    .style("width", el.offsetWidth)
    .style("height", 200)
  .append("g")

  svg.append("g")
    .attr("class", "slices");
  svg.append("g")
    .attr("class", "labels");
  svg.append("g")
    .attr("class", "lines");

  var width = el.offsetWidth/2,
      height = 200,
      radius = Math.min(width, height) / 2;

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.value;
    });

  var arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

  var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  svg.attr("transform", "translate(" + width + "," + radius + ")");

  var key = function(d){ return d.data.label; };
  //change(svg, pie, key, radius, arc, outerArc, randomData());
  change(svg, pie, key, radius, arc, outerArc, data);
  console.log(data);
};

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 0.8, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
module.exports = d3PieChart;