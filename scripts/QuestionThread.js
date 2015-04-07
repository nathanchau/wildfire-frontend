'use strict';
require('./base.css');

var React = require('react');
var QuestionBox = require('./QuestionBox');
var NavBar = require('./NavBar');

//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var DetailedStats = require('./DetailedStats');

//Quick view
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');
var ReusableSlider = require('./ReusableSlider');

var LogInContainer = require('./LogInContainer');
var QuestionCreatorContent = require('./QuestionCreatorContent');

// URLs
var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";
var GET_USER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/users/";
var GET_REPLIES_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/replies/";
var POST_ANSWER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";

var QuestionThread = React.createClass({
	getInitialState: function() {
		return {questionList:null, currentUser: {username:null, first_name:null, avatarUrl:null, id:null}};
	},
	handleResponse: function(questionId, answer, currentUserId) {var JSONObj = { "user": currentUserId, "question": questionId, "answer": answer };
    var JSONStr = JSON.stringify(JSONObj);
    console.log('User ' + currentUserId + ' answered question ' + questionId + ' with answer ' + answer);
    if(!currentUserId) {
      console.log("User is not signed in, userId is null");
      return;
    }
    $.ajax({
        url: POST_ANSWER_URL,
        dataType: 'json',
        type: 'POST',
        data: JSONStr,
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
          var newData = this.state.data;
          newData.response.popularQuestions.forEach(function(question) {
            if(question.id == questionId) {
              console.log("Replacing old answers for question " + question.id)
              question.answers=data.response.answers;
              question.quick=data.response.quick;
              question.usersAnswer=data.response.usersAnswer;
            }
          });
          this.getStats(questionId, newData);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(status, err.toString());
        }.bind(this)
      });
  },
  getStats: function(questionId, dirtyData) {
    var newData = dirtyData;
    $.ajax({
        url: GET_STATS_URL + questionId + "/",
        dataType: 'json',
        success: function(data) {
          var response = data.response;
          newData.response.popularQuestions.forEach(function(question) {
            if(question.id == questionId) {
              question.stats=response;
            }
          });
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
    if (this.isMounted()) {
      this.setState({data: newData});
      console.log("newData")
      console.log(newData);
    }
  },
	handleLogIn: function(data) {
		console.log('(In HomePage) New User Authenticated ' + data.username);
		if (this.isMounted()) {
  			this.setState({currentUser: data});
  		}
  		// Set client-side cookie to token
  		// Currently set to expire a long time from now
  		// Todo: Implement Log Out
  		if (data.token) {
  			document.cookie = "token=" + data.token + "; expires=Mon, 1 Jan 2020 00:00:00 UTC";
  		}
	},
	eraseUser: function() {
    	console.log("Erasing");
    	// Erase cookie
  		document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  		if (this.isMounted()) {
  			this.setState({currentUser: {username:null, first_name:null, avatarUrl:null, id:null}});
  		}
	},
	loadQuestionsFromServer: function() {
	    $.ajax({
	        url: GET_REPLIES_URL + this.props.id + "/",
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
	      		} else if (this.props.tempToken) {
	            // Immediately after logging in, cookies not accessible - allows us to authenticate in this case
	            xhr.setRequestHeader("Authorization", "Token " + this.props.tempToken);
	          }
	      	}.bind(this),
	        success: function(data) {
	          if (this.isMounted()) {
	            this.setState({questionList: data.response});
	          }
	          this.handleLogIn(data.user);
	        }.bind(this),
	        error: function(xhr, status, err) {
	          console.error(url, status, err.toString());
	        }.bind(this)
	    });
	},
	componentDidMount: function() {
	    this.loadQuestionsFromServer();
	},
	render: function() {
		return (
			<QuestionList 
	          	data={this.state.questionList} 
	          	currentUser={this.state.currentUser}
	          	onResponse={this.handleResponse} />
		);
	}

});

// Questions
// Probably the worst code ever
var QuestionList = React.createClass({
  componentDidUpdate: function() {
    console.log("qlist did update");
    console.log(this.props.data);
  },
	render: function() {
	    if(this.props.data) {
	  		var questionNodes = this.props.data.map(function (question, index) {
	  			return (
	  				<Question onResponse={this.props.onResponse} index={index} questionText={question.text} questionType={question.questionType} questionId = {question.id} username={question.asker.username} firstName={question.asker.first_name} answerList={question.options} answerUrl={POST_ANSWER_URL} avatarUrl={question.asker.avatarUrl} answerOptions={question.options} currentUser={this.props.currentUser} categories={question.categories} stats={question.quick} usersAnswer={question.usersAnswer} answers={question.answers}/>
	  			);
	  		}.bind(this));
	    }
		return (
			<div className="questionList smallQuestionList">
				{questionNodes}
			</div>
		);
	}
});

var Question = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    // Only update if the usersAnswer was recently updated
    if(nextProps.usersAnswer && !this.props.usersAnswer) {
      return true;
    }
    return false;
  },
	render: function() {
		var answeredNode;
		return (
			<div className="question">
			  <QuestionHeader QuestionHeader avatarUrl={this.props.avatarUrl} id={this.props.currentUser.id} username={this.props.username} firstName={this.props.firstName} score={this.props.answers.length} categories={this.props.categories}/>
				
        <QuestionContent 
          index={this.props.index} onResponse={this.props.onResponse} questionType={this.props.questionType} questionText={this.props.questionText} answerUrl={this.props.answerUrl} questionId = {this.props.questionId} answerList={this.props.answerList} answerOptions={this.props.answerOptions} currentUser={this.props.currentUser} stats={this.props.stats} usersAnswer={this.props.usersAnswer}/>
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
    var avatarClassName;
    if (this.props.avatarUrl) {
      avatarUrl = this.props.avatarUrl;
      avatarClassName = "questionAvatar";
    } else {
      avatarUrl = "../images/wildfire-logo.png";
      avatarClassName = "questionAvatar square";
    }
    var categoryText;
    if (typeof this.props.categories != 'undefined' && this.props.categories.length > 0) {
    	categoryText = "asked about " + this.props.categories.join(", ");
    } else {
    	categoryText = "asked";
    }
    return (
      <div className={classString}>
        <a href={"/profile/"+this.props.id}>
        <img src={avatarUrl} className={avatarClassName} />
        <div className="questionUsername">{this.props.firstName}</div>
        </a>
        <div className="questionCategory">{categoryText}</div>
        <div className="questionScore">{this.props.score}</div>
        <div className="questionScoreAccessory">answered</div>
        <div className="questionAsk">{this.props.condensedText}</div>
      </div>
    );
  }
});

var QuestionContent = React.createClass({
	render: function() {
    var answerNode;
    switch(this.props.questionType) {
      case "MC":
          answerNode=<AnswerList 
            index={this.props.index}
            questionType={this.props.questionType}
            answerOptions={this.props.answerOptions} 
            questionId={this.props.questionId}
            answers={this.props.answers} 
            currentUser={this.props.currentUser}
            stats={this.props.stats}
            onResponse={this.props.onResponse} 
            usersAnswer={this.props.usersAnswer}/>
          break;
      case "RG":
          answerNode=<RangeSliderAnswer
            index={this.props.index}
            questionType={this.props.questionType}
            rangeMin={this.props.answerOptions[0]}
            rangeMax={this.props.answerOptions[1]}
            questionId={this.props.questionId}
            currentUser={this.props.currentUser}
            stats={this.props.stats}
            onResponse={this.props.onResponse} 
            usersAnswer={this.props.usersAnswer}/>
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
  detailsClick: function() {
    if(this.props.stats) {
      console.log("going to detailed stats");
      navigate('/detailedStats/' + this.props.questionId);
    }
  },
	handleClick: function(index) {
    this.props.onResponse(this.props.questionId, index, this.props.currentUser.id);
	},
	render: function() {
    var stats;
    if(this.props.stats) {
      stats=[this.props.stats.option1, this.props.stats.option2, this.props.stats.option3, this.props.stats.option4, this.props.stats.option5];
    }
		return (
			<div className="answerList">
				<BarChart 
                data={this.props.answerOptions}
                stats={stats}
                usersAnswer={this.props.usersAnswer}
                on_click_fn={this.handleClick}/>
        {this.props.usersAnswer ? <button className="detailedStatsButton" onClick={this.detailsClick}>See statistics</button> : null}
			</div>
		);
	}
});

var RangeSliderAnswer = React.createClass({
  getInitialState: function() {
    return {
      width: 300
    };
  },
  detailsClick: function() {
    if(this.props.usersAnswer && this.props.stats) {
      console.log("going to detailed stats");
      navigate('/detailedStats/' + this.props.questionId);
    }
  },
  handleSubmit: function(slideValue) {
    console.log("submitting response " + slideValue);
    this.props.onResponse(this.props.questionId, slideValue, this.props.currentUser.id);
  },
  componentDidMount: function() {
    // Set slider width to available space in this DOMNode
    this.setState({width: this.getDOMNode().offsetWidth});
    console.log("updated width to " + this.state.width);
  },
  render: function() {
  	var handlesToDisplay;
    if(this.props.usersAnswer && this.props.stats) {
      handlesToDisplay={usersAnswer: this.props.usersAnswer.answer, all: this.props.stats};
    }
    var bounds = {min: this.props.rangeMin, max: this.props.rangeMax};
    return (
      <div className="answerList">
        <ReusableSlider bounds={bounds} width={this.state.width} onSubmit={this.handleSubmit} handlesToDisplay={handlesToDisplay}/>
        {this.props.usersAnswer ? <button className="detailedStatsButton" onClick={this.detailsClick}>See statistics</button> : null}
      </div>
    );
  }
});

module.exports = QuestionThread;