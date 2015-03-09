'use strict';
require('./base.css');

var React = require('react');
var PieChart = require('./PieChart');
var BarChart = require('./BarChart');

var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";
var pollInterval = 200000;

var DetailedStats = React.createClass({
  propTypes: {
    id: React.PropTypes.string
    //questionObj: React.PropTypes.object
  },
  getInitialState: function() {
    return {questionObj: null, stats: null};
  },

  loadQuestionFromServer: function() {
    $.ajax({
        url: GET_QUESTION_URL + this.props.id + "/",
        dataType: 'json',
        success: function(data) {
          if (this.isMounted()) {
            this.setState({questionObj: data.response});
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
  },

  loadStatsFromServer: function() {
    $.ajax({
        url: GET_STATS_URL + this.props.id + "/",
        dataType: 'json',
        success: function(data) {
          if (this.isMounted()) {
            this.setState({stats: data.response});
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
  },

  componentDidMount: function() {
    this.loadQuestionFromServer();
    this.loadStatsFromServer();
    setInterval(this.loadQuestionsFromServer, pollInterval);
  },

  render: function() {
    return (
      <div className="questionList">
        <Question questionObj={this.state.questionObj} stats={this.state.stats} />
      </div>//PieChart data={this.props.data}/>;
    );
  }
});

var Question = React.createClass({
  getInitialState: function() {
    return {questionObj: null};
  },
  render: function() {
    if(!this.props.questionObj) {
      return null;
    }
    console.log(this.props.questionObj);
    return (
      <div className="question">
        <QuestionHeader 
          avatarUrl={this.props.questionObj.asker.avatarUrl} 
          username={this.props.questionObj.asker.username} 
          first_name={this.props.questionObj.asker.first_name} 
          score={this.props.questionObj.answers.length} />
        
        <QuestionContent 
          index={this.props.index}
          questionText={this.props.questionObj.text} 
          questionId = {this.props.questionObj.id} 
          answerOptions={this.props.questionObj.options} 
          isAnswered={true}// TODO change to use actual isAnswered field  
          answers={this.props.questionObj.answers} 
          currentUser={this.props.currentUser}
          stats={this.props.stats} />

        <h3>What the men think</h3>
        <PieChart answerOptions={this.props.questionObj.options} data={this.props.stats.male}/>
        <h3>What the women think</h3>
      </div>
    );
  }
});

var QuestionHeader = React.createClass({
  render() {
    var classString = 'questionHeader';
    if (this.props.isCondensed) {
      classString += ' condensed';
    }
    var avatarUrl;
    if (this.props.avatarUrl) {
      avatarUrl = this.props.avatarUrl;
    } else {
      avatarUrl = "";
    }
    return (
      <div className={classString}>
        <img src={avatarUrl} className="questionAvatar" />
        <div className="questionUsername">{this.props.first_name}</div>
        <div className="questionCategory">asked about Technology</div>
        <div className="questionScore">{this.props.score}</div>
        <div className="questionScoreAccessory">answered</div>
        <div className="questionAsk">{this.props.condensedText}</div>
      </div>
    );
  }
});

var QuestionContent = React.createClass({
  render: function() {
    //console.log(this.props.onResponse);
    return (
      <div className="questionContent">
        <div className="questionText">{this.props.questionText}</div>
        <AnswerList 
          index={this.props.index}
          answerOptions={this.props.answerOptions} 
          questionId={this.props.questionId} 
          isAnswered={this.props.isAnswered} 
          answers={this.props.answers} 
          currentUser={this.props.currentUser}
          stats={this.props.stats} />
        
      </div>
    );
  }
});

var AnswerList = React.createClass({
  getInitialState: function() {
      return {
          stats: this.props.stats
      };
    },

  render: function() {
    if(!this.props.stats) {
      return null;
    }
    var response = this.props.stats;
    var statsArray = [response.quick.option1, response.quick.option2, response.quick.option3, response.quick.option4, response.quick.option5];
    console.log(this.props.stats);
    return (
      <div className="answerList" onClick={this.detailsClick}>
        <BarChart 
                data={this.props.answerOptions}
                stats={statsArray}
                isAnswered={true}
                on_click_fn={null}/>
      </div>
    );
  }
});

module.exports = DetailedStats;