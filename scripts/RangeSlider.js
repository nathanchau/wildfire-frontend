/** @jsx React.DOM */
var React = require('react');
var d3Slider = require('./d3Slider');
var d3 = require('d3');

var oldValue = null;
var RangeSlider = React.createClass({
  propTypes: {
    min: React.PropTypes.string,
    max: React.PropTypes.string,
    onSlideFn: React.PropTypes.func,
    startValue: React.PropTypes.number,
    statsAvg: React.PropTypes.number,
    isOnlyDisplayingStaticStats: React.PropTypes.bool
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    console.log("inSlider " + this.getChartState());
    d3Slider.create(el, 
      this.getChartState())
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    // Only update slider if a new statsAvg was obtained. Prevents unnecessary component updates
    if(this.getChartState().statsAvg && oldValue != this.getChartState().statsAvg) {
      oldValue = this.getChartState().statsAvg;
      d3Slider.update(el, this.getChartState());
    }
  },

  getChartState: function() {
    return {
      min: this.props.min,
      max: this.props.max,
      onSlideFn: this.props.onSlideFn,
      startValue: this.props.startValue,
      statsAvg: this.props.statsAvg,
      isOnlyDisplayingStaticStats: this.props.isOnlyStats
    };
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3Slider.destroy(el);
  },

  render: function() {
    return (
        <div className="RangeSlider">
        </div>
    );
  }
});

module.exports = RangeSlider;