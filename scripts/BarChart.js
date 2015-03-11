/** @jsx React.DOM */
var React = require('react');
var d3BarChart = require('./d3BarChart');

var BarChart = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    stats: React.PropTypes.array,
    isAnswered: React.PropTypes.number,
    on_click_fn: React.PropTypes.func
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    d3BarChart.create(el, 
      this.getChartState());
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3BarChart.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      stats: this.props.stats,
      isAnswered: this.props.isAnswered,
      on_click_fn: this.props.on_click_fn
    };
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3BarChart.destroy(el);
  },

  render: function() {
    return (
      <div className="BarChart"></div>
    );
  }
});

module.exports = BarChart;
