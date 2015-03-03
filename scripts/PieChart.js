/** @jsx React.DOM */
var React = require('react');
var d3PieChart = require('./d3PieChart');

var PieChart = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    d3PieChart.create(el, {
      width: '100%',
      height: '300px'
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3PieChart.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain
    };
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    d3PieChart.destroy(el);
  },

  render: function() {
    return (
      <div className="PieChart"></div>
    );
  }
});

module.exports = PieChart;
