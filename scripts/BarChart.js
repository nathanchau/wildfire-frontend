/** @jsx React.DOM */
var React = require('react');
var d3BarChart = require('./d3BarChart');

var BarChart = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    stats: React.PropTypes.array,
    usersAnswer: React.PropTypes.number,
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
      usersAnswer: this.props.usersAnswer,
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
