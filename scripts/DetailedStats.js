'use strict';
require('./base.css');

var React = require('react');
var PieChart = require('./PieChart');
var BarChart = require('./BarChart');
var RangeSlider = require('./RangeSlider');
var NavBar = require('./NavBar');
var LogInContainer = require('./LogInContainer');

var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";
var pollInterval = 200000;

var DetailedStats = React.createClass({
  propTypes: {
    id: React.PropTypes.string
    //questionObj: React.PropTypes.object
  },
  getInitialState: function() {
    return {questionObj: null, stats: null, currentUser: {username:null, first_name:null, avatarUrl:null, id:null}};
  },

  loadQuestionFromServer: function() {
    $.ajax({
        url: GET_QUESTION_URL + this.props.id + "/",
        dataType: 'json',
        beforeSend: function(xhr) {
          // Get cookie and set header
          var cookies = document.cookie.split(";");
          var tokenValue;
          for (var i = 0; i < cookies.length; i++) {
            var eachCookie = cookies[i].split("=");
            if (eachCookie[0] == "token") {
              tokenValue = eachCookie[1];
            }
          }
          console.log("Token is " + tokenValue);
          if (tokenValue) {
            xhr.setRequestHeader("Authorization", "Token " + tokenValue);
          }
        },
        success: function(data) {
          if (this.isMounted()) {
            this.setState({questionObj: data.response});
            if (data.user) {
              this.setState({currentUser: data.user});
            }
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
    var logInHidden;
    if (!this.state.currentUser.id) {
      logInHidden = false;
    } else {
      logInHidden = true;
    }
    return (
      <div className="body">
        <NavBar currentUser={this.state.currentUser} />
        <div className="questionBox">
          <LogInContainer isHidden={logInHidden} onLogIn={this.handleLogIn}/>
          <div className="questionList">
            <Question questionObj={this.state.questionObj} stats={this.state.stats} />
          </div>
        </div>
      </div>
    );
  }
});

var Question = React.createClass({
  render: function() {
    if(!this.props.questionObj || !this.props.stats) {
      return null;
    }
    var furtherStats;
    switch(this.props.questionObj.questionType) {
      case "MC":
          furtherStats=<div> 
            <h4>What the men think</h4>
            <PieChart answerOptions={this.props.questionObj.options} data={this.props.stats.male}/>
            <h4>What the women think</h4>
            <PieChart answerOptions={this.props.questionObj.options} data={this.props.stats.female}/>
          </div>
          break;
      case "RG":
          furtherStats=<div className="furtherStats">
            <h4>What the men think</h4>
            <RangeSlider
                min={this.props.questionObj.options[0]} 
                max={this.props.questionObj.options[1]} 
                onSlideFn = {null}
                startValue = {-1}
                statsAvg = {this.props.stats.male}
                isOnlyStats={true}/>
            <h4>What the women think</h4>
            <RangeSlider
                min={this.props.questionObj.options[0]} 
                max={this.props.questionObj.options[1]} 
                onSlideFn = {null}
                startValue = {-1}
                statsAvg = {this.props.stats.female}
                isOnlyStats={true}/>
            </div>
          break;
      default:
          console.log("Invalid question type = " + this.props.questionType);
          return(null);
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
          questionType={this.props.questionObj.questionType}
          questionText={this.props.questionObj.text} 
          questionId = {this.props.questionObj.id} 
          answerOptions={this.props.questionObj.options} 
          isAnswered={true}// TODO change to use actual isAnswered field  
          answers={this.props.questionObj.answers} 
          currentUser={this.props.currentUser}
          stats={this.props.stats} />
        {furtherStats}
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
  render(){
    var answerNode;
    switch(this.props.questionType) {
      case "MC":
          answerNode=<AnswerList 
            stats={this.props.stats}
            index={this.props.index}
            questionType={this.props.questionType}
            answerOptions={this.props.answerOptions} 
            questionId={this.props.questionId} 
            isAnswered={this.props.isAnswered} 
            answers={this.props.answers} 
            currentUser={this.props.currentUser}
            onResponse={this.props.onResponse} />
          break;
      case "RG":
          answerNode=<RangeSliderAnswer
            statsAvg={this.props.stats.avg}
            index={this.props.index}
            questionType={this.props.questionType}
            rangeMin={this.props.answerOptions[0]}
            rangeMax={this.props.answerOptions[1]}
            questionId={this.props.questionId} 
            isAnswered={this.props.isAnswered} 
            currentUser={this.props.currentUser}
            onResponse={this.props.onResponse} />
          break;
      default:
          console.log("Invalid question type = " + this.props.questionType);
          return(null);
    }
    return (
      <div className="questionContent">
        <div className="questionText">{this.props.questionText}</div>
        {answerNode}
      </div>
    );
  }
});

var AnswerList = React.createClass({

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

var RangeSliderAnswer = React.createClass({

  render: function() {
    return (
      <div className="answerList" onClick={this.detailsClick}>
        <RangeSlider
                min={this.props.rangeMin}
                max={this.props.rangeMax}
                onSlideFn = {null}
                statsAvg = {this.props.statsAvg}/>
        </div>
    );
  }
});
module.exports = DetailedStats;