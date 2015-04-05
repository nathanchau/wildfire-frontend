// ReusableSlider.js
/* Componentized d3 slider, inspired by http://10consulting.com/2014/02/19/d3-plus-reactjs-for-charting/
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
        .orient("bottom")
        .tickFormat(function(d) { return d; })
        .tickSize(0)
        .tickPadding(12);
      d3.select(this.getDOMNode())
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.props.height/2 + ")")
          .call(xAxis)
          .select(".domain")
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("class", "halo");
    }
    return(
      <g/>
    );
  }
});

var Handle = React.createClass({
  render: function() {
    return (
      <circle className={this.props.className} cx={this.props.cx} transform={"translate(0," + this.props.height/2 + ")"} r={9}/>
    );
  }
});

var Slider = React.createClass({
  getInitialState: function() {
    return {
      curValue: this.props.bounds.min,
      buttonColor: "rgb(46, 204, 113)"
    };
  },
  onMouseOver: function() {
    if(!this.props.quick)
      this.setState({buttonColor: "Orange"});
  },
  onMouseOut: function() {
    if(!this.props.quick)
      this.setState({buttonColor: "rgb(46, 204, 113)"});
  },
  onClick: function(e){
    if(!this.props.quick)
      this.props.onSubmit(this.state.curValue);
  },
  componentDidMount: function() {
    if(this.props.quick) {
      this.setState({curValue: this.props.quick.usersAnswer, buttonColor: "rgb(244,244,244)"});
    }
  },
  render: function() {
    // Access thisObj and thisProps to set state inside brushed implicit function
    var thisObj = this; 
    var thisProps = this.props;
    var gap = 15; // gap between slider and button
    var sliderWidth = this.props.width-gap-this.props.buttonWidth;

    var x = d3.scale.linear()
      .domain([this.props.bounds.min, this.props.bounds.max])
      .range([0, sliderWidth])
      .clamp(true);

    var brush = d3.svg.brush()
      .x(x)
      .extent([0, 0])
      .on("brush", brushed);


    if(this.isMounted()) {
      if(!this.props.quick) {
        //slider encapsulates horizontal scale, without the button
        d3.select(".slider")
          .call(brush)
          .selectAll(".extent,.resize")
          .remove();
        }
    }

    if(this.props.quick) {
      var avgHandle=<Handle className="averageCircle" cx={x(this.props.quick.average)} height={this.props.height}/>
    }

    function brushed() {
      console.log(thisProps.quick);
      if(!thisProps.quick) {
        var value = brush.extent()[0];
        if (d3.event.sourceEvent) { // is mouse, not a programmatic event
          value = Math.round(x.invert(d3.mouse(this)[0]));
          brush.extent([value, value]);
        }
        thisObj.setState({curValue: value});
      }
    }
    return (
      <g>
        <g className="slider">
          <Axis bounds={this.props.bounds} width={sliderWidth} height={this.props.height}/>
          <Handle className="handle" cx={x(this.state.curValue)} height={this.props.height}/>
          {avgHandle}
        </g>
        <g className="buttonText">
          <rect fill={this.state.buttonColor} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} onClick={this.onClick} x={sliderWidth+gap} width={this.props.buttonWidth} height={this.props.height}/>
          <text dy={".25em"} x={sliderWidth+gap+this.props.buttonWidth/2} textAnchor="middle" y={this.props.height/2}>{this.state.curValue}</text>
        </g>
      </g>
    );
  }
});

var ReusableSlider = React.createClass({
  getDefaultProps: function() {
    return {
      bounds: {min: 0, max: 10},
      width: 960,
      height: 70,
      margin: {top: 10, right: 20, bottom: 20, left: 10},
      quick: null//{usersAnswer: 5, average: 2}
    }
  },
  render: function() {
    var buttonWidth = 40;
    return (
      <Chart width={this.props.width} height={this.props.height} margin={this.props.margin}>
        <Slider buttonWidth={buttonWidth} onSubmit={this.props.onSubmit} bounds={this.props.bounds} width={this.props.width - this.props.margin.left - this.props.margin.right} height={this.props.height - this.props.margin.top - this.props.margin.bottom} quick={this.props.quick}/>
      </Chart>
    );
  }
});

module.exports = ReusableSlider;