/** @jsx React.DOM */
var React = require('react');
var d3PieChart = require('./d3PieChart');

var PieChart = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    answerOptions: React.PropTypes.array
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    console.log("inPie " + this.getChartState());
    d3PieChart.create(el,this.getChartState());
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3PieChart.update(el, this.getChartState());
  },

  getChartState: function() {
    var statsObj = this.props.data;
    var statsArray = [statsObj.option1, statsObj.option2, statsObj.option3, statsObj.option4, statsObj.option5];
    var truncatedStats = new Array();
    // Truncate stats as necessary to match data.length
    for (var i = 0; i < this.props.answerOptions.length; i++) {
      truncatedStats[i] = {"label": this.props.answerOptions[i], "value": statsArray[i]};
    }
    return {
      data: truncatedStats//getData()
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
