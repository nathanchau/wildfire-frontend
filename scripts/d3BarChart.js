// d3BarChart.js
require('./base.css');

var d3 = require('d3');
var d3BarChart = {};

d3BarChart.create = function(el, state) {
  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
  svg.append('g')
      .attr('class', 'd3-bars');

  this.update(el, state);
};

d3BarChart.update = function(el, state) {
  // Render data bars
  this._drawBars(el, state.data, state.stats, state.usersAnswer, state.on_click_fn);
};

d3BarChart.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};

/* Normalizes stats to be out of 100 */
d3BarChart._drawBars = function(el, answerOptions, untrimmedStats, usersAnswer, on_click_fn) {
  if(!answerOptions) {
    console.log("answerOptions is null");
    return;
  }
  console.log("usersAnswer " + usersAnswer);
  console.log("answerOptions " + answerOptions);
  console.log("untrimmedStats " + untrimmedStats);

  var gap = 2; // Pixel space between bars and with textWidth
  var textWidth = 40; 
  var barWidth = el.offsetWidth - 20;
  var barHeight = 30;

  var chart = d3.select(el).selectAll("svg");
  if ( chart.empty() ) chart = d3.select(el).append("svg");

  chart
      .attr("class",  "chart")
      .attr("width",  el.offsetWidth)
      .attr("height", (barHeight + gap * 2) * answerOptions.length);

  if(untrimmedStats) {
    var stats = new Array();
    console.log("untrimmedStats = " + untrimmedStats);
    // Truncate stats as necessary to match answerOptions.length
    for (var i = 0; i < answerOptions.length; i++) {
      stats[i] = untrimmedStats[i];
    }
    console.log("stats = " + stats);
    // Scale for normalizing stats out of 100
    var statsSum = d3.sum(stats);
    var statsNormScale = d3.scale.linear()
      .domain([0, statsSum])
      .rangeRound([0, 100]);
  }
  
  var x = d3.scale.linear()
      .domain([0, statsSum])
      .range([0, barWidth]);

  var y = d3.scale.ordinal()
      .domain(answerOptions)
      .rangeRoundBands([0, (barHeight + 2 * gap) * answerOptions.length]);

  var backgroundBars = chart.selectAll("rect .background")
       .data(answerOptions);
  var bars = chart.selectAll("rect .bar")
      .data(answerOptions);
  var answers = chart.selectAll("text .answers")
      .data(answerOptions)
  var statsText = chart.selectAll("text .stats")
       .data(stats);
  
  backgroundBars.enter()
      .append('rect')
      .classed('background', true)
      .attr('x', 0)
      .attr('y', function(d, i) {return y(d) + gap })
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('fill', 'rgb(244, 244, 244)')
      .on("mouseover", !usersAnswer ? function() {
        d3.select(this).style("fill", "orange");
      }: null)
      .on("mouseout", function() {
        d3.select(this).style("fill", "rgb(244, 244, 244)")
      })
      .on("click", function(d, i) {
        if(!usersAnswer) {
          on_click_fn(i);
          console.log("rect" + d);
        }
      });

  bars.enter()
      .append("rect")
      .classed('bar', true)
      .attr('x', 0)
      .attr('y', function(d, i) {return y(d) + gap })
      .attr('width', 0)
      .attr('height', barHeight)
      .attr('fill', 'deepskyblue');

  // If this question has been answered, fill the mult choice option with a green color
  if(usersAnswer) {
    bars.attr('fill', function(d, i) {
      if(i == usersAnswer) {
        return "rgb(46, 204, 113)";
      } else {
        return 'deepskyblue';
      }
    // Kill mouseover and mouseout actions
    });
  }

  // Disable mouseover function
  if(untrimmedStats) {
    backgroundBars.on("mouseover", function() {null;})
    .on("mouseout", function() {null;});
  }
  
  // Add text labels
  answers.enter()
    .append("text")
    .classed('answers', true)
    .attr("x", 20) 
    .attr("y", function(d){ return y(d) + y.rangeBand()/2; } )
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "start")
    .text(function(d) { return d;});

  statsText.enter()
    .append("text")
      .classed('stats', true)
      .attr("x", barWidth - textWidth/2) 
      .attr("y", function(d, i){ return (i+0.5)*(barHeight + 2*gap)} )
      .attr("dx", 0)
      .attr("dy", ".36em")
      .attr("text-anchor", "middle")
      .text(function(d, i) { return statsNormScale(stats[i]) + "%";})
      .style("visibility", "hidden");

  // Update
 if(untrimmedStats) {
    bars
      .attr("width", 0)
        .transition()
        .duration(500)
      .attr("width", function(d, i) {return x(stats[i]);});

    statsText
    .style("visibility", "visible");
  } 

  backgroundBars.exit()
    .transition()
        .duration(250)
      .attr("x",      0)
      .attr("width", 0)
      .remove();
  // Exit
  bars.exit()
      .transition()
        .duration(250)
      .attr("x",      0)
      .attr("width", el.offsetWidth)
      .remove();
};

module.exports = d3BarChart;