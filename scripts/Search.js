'use strict';
require('./base.css');

var React = require('react');
var NavBar = require('./NavBar');
var LogInContainer = require('./LogInContainer');

//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var DetailedStats = require('./DetailedStats');

//Quick view
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');
var RangeSlider = require('./RangeSlider');


var SEARCH_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/search/";
var POST_ANSWER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";


var Search = React.createClass({
	getInitialState: function() {
		return {questionList: null, userList: null, currentUser: {username:null, first_name:null, avatarUrl:null, id:null}};
	},
  	loadDataFromServer: function() {
    	$.ajax({
        	url: SEARCH_URL,
        	data: {"q": this.props.q},
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
          		if (tokenValue) {
            		xhr.setRequestHeader("Authorization", "Token " + tokenValue);
          		}
        	},
        	success: function(data) {
          		if (this.isMounted()) {
            		this.setState({questionList: data.response.questions, userList: data.response.users});
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
  	componentDidMount: function() {
  		this.loadDataFromServer();
  	},
	render: function() {
	    var logInHidden;
	    if (!this.state.currentUser.id) {
	      logInHidden = false;
	    } else {
	      logInHidden = true;
	    }
		return(
	      <div className="body">
	      	<NavBar currentUser={this.state.currentUser} />
	      	<div className="searchBar"><i className="fa fa-search"></i> {this.props.q}</div>
	      	<div className="userBox">
	      		<UserList 
	      			data={this.state.userList}
	      			currentUser={this.state.currentUser}/>
	      	</div>
	        <div className="questionBox">
				<QuestionList 
          			data={this.state.questionList} 
          			currentUser={this.state.currentUser}
          			onResponse={this.handleResponse} />
	        </div>
	      </div>
		);
	}
});

// Users
var UserList = React.createClass({
	render: function() {
		if(this.props.data) {
			var userNodes = this.props.data.map(function (user, index) {
				return(
					<User index={index} avatarUrl={user.avatarUrl} username={user.username} first_name={user.first_name}/>
				);
			}.bind(this));
		}
		return(
			<div className="userList">
				{userNodes}
			</div>
		);
	}
});

var User = React.createClass({
	render: function() {
		return(
			<div className="userContent">
				<img className="userAvatarImage" src={this.props.avatarUrl} />
				<span className="userFirstName">{this.props.first_name}</span>
				<span className="userUsername">{this.props.username}</span>
			</div>
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
			<div className="questionList">
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
      statsAvg: null, 
      curValue: 0,
    };
  },
  onSlideFn: function(value) {
    this.setState({curValue: value});
  },
  detailsClick: function() {
    if(this.state.statsAvg) {
      console.log("going to detailed stats");
      navigate('/detailedStats/' + this.props.questionId);
    }
  },
  postAnswer: function() {
    var JSONObj = { "user": this.props.currentUser.id, "question": this.props.questionId, "answer": this.state.curValue };
    var JSONStr = JSON.stringify(JSONObj);
    console.log('You chose ' + this.state.curValue);
    $.ajax({
        url: POST_ANSWER_URL,
        dataType: 'json',
        type: 'POST',
        data: JSONStr,
        success: function(data) {
          this.props.onResponse(data);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
        }.bind(this)
      });
    this.getStats();
  },
  getStats: function() {
    $.ajax({
        url: GET_STATS_URL + this.props.questionId + "/",
        dataType: 'json',
        success: function(data) {
          var response = data.response;
          console.log(response);
          if (this.isMounted()) {
            /*statsArray = [response.quick.option1, response.quick.option2, response.quick.option3, response.quick.option4, response.quick.option5];*/
            this.setState({statsAvg: response.avg});
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
  },
  render: function() {
    return (
      <div className="answerList" onClick={this.detailsClick}>
        <RangeSlider
                min={this.props.rangeMin}
                max={this.props.rangeMax}
                onSlideFn = {this.onSlideFn}
                startValue={0}
                statsAvg = {this.state.statsAvg}
                isOnlyStats={false}/>
        <button className="btn" onClick={this.postAnswer}>{this.state.curValue}</button>
      </div>
    );
  }
});



module.exports = Search;