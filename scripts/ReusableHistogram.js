// ReusableHistogram.js
/* Componentized d3 histogram, inspired by http://10consulting.com/2014/02/19/d3-plus-reactjs-for-charting/
*/

var React = require('react');
var d3 = require('d3');

var Chart = React.createClass({
  render: function() {
    return (
      <svg width={this.props.width} height={this.props.height}>
        <g transform={"translate(" + this.props.margin.left + "," + this.props.margin.top + ")"}>
        {this.props.children}</g></svg>
    );
  }
});

var Axis = React.createClass({
  render: function() {
    if(this.isMounted()) {
      var x = d3.scale.linear()
      .domain([this.props.bounds.min, this.props.bounds.max])
      .range([0, this.props.width]);
      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
      d3.select(this.getDOMNode())
          .attr("class", "x histogramAxis")
          .attr("transform", "translate(0," + this.props.height + ")")
          .call(xAxis);
    }
    // Dummy return, as actual rendering is performed in componentDidMount(), via call(xAxis)
    return(
      <g/>
    );
  }
});
var Bar = React.createClass({
  getDefaultProps: function() {
    return {
      width: 0,
      height: 0,
      offset: 0
    }
  },

  render: function() {
    // A formatter for counts.
    var formatCount = d3.format(",.0f");
    // A hacky function used to display text on histogram bars iff bar is tall enough, else don't display
    function displayText(barHeight, text) {
      if(barHeight < 20) {
        return "";
      } else {
        return formatCount(text);
      }
    }
    return (
      <g className="bar">
        <rect fill={this.props.color}
          width={this.props.width} height={this.props.height} 
          x={this.props.offset} y={this.props.availableHeight - this.props.height} />
        <text dy={".75em"} y={this.props.availableHeight - this.props.height + 6} x={this.props.offset + (this.props.width+1)/2} textAnchor={"middle"}>{displayText(this.props.height, this.props.count)}</text>
      </g>
    );
  }
});

var DataSeries = React.createClass({
  getDefaultProps: function() {
    return {
      title: '',
      data: []
    }
  },

  render: function() {
    var props = this.props;

    var x = d3.scale.linear()
      .domain([this.props.bounds.min, this.props.bounds.max])
      .range([0, this.props.width]);

    var numBins=this.props.bounds.max-this.props.bounds.min;
    // Half the number of bins if there are too many. Hacky, as there can still be thousands of bins if there's a huge range
    if(numBins > 20) {
      numBins/=2;
    }
    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(numBins))
          (this.props.data);
    console.log(data);
    var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([this.props.height, 0]);   

    var bars = data.map(function(point, i) {
      return (
        <Bar height={props.height - y(point.y)} count={data[i].y}width={(x(data[0].dx) - x(0)) - 1} offset={x(point.x)} availableHeight={props.height} color={props.color} key={i} />
      )
    });

    return (
      <g>{bars}</g>
    );
  }
});

var ReusableHistogram = React.createClass({
  getDefaultProps: function() {
    return {
      bounds: {min: 1, max: 10},
      values: [1,6,5,9],
      width: 960,
      height: 100,
      margin: {top: 10, right: 20, bottom: 20, left: 10}
    }
  },
  render: function() {
    return (
      <Chart width={this.props.width} height={this.props.height} margin={this.props.margin}>
        <DataSeries data={this.props.values} bounds={this.props.bounds} width={this.props.width - this.props.margin.left - this.props.margin.right} height={this.props.height - this.props.margin.top - this.props.margin.bottom} color="cornflowerblue" />
        <Axis bounds={this.props.bounds} width={this.props.width - this.props.margin.left - this.props.margin.right} height={this.props.height - this.props.margin.top - this.props.margin.bottom}/>
      </Chart>
    );
  }
});

module.exports = ReusableHistogram;