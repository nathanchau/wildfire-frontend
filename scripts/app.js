'use strict';
require('./base.css');
require('./expanding');
require('jquery');

var React = require('react');
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');
var LogInCreatorContent = require('./LogInCreatorContent');
var QuestionCreatorContent = require('./QuestionCreatorContent');

var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";
var POST_ANSWER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";

var sampleStats = [5, 10, 20, 65, 0];//, 10, 15, 10, 20, 50, 75, 20, 10, 5];
var piedata = [ {name: "one", value: 10375},
      {name: "two", value:  7615},
      {name: "three", value:  832},
      {name: "four", value:  516},
      {name: "five", value:  491} ];

var QuestionBox = React.createClass({
	loadQuestionsFromServer: function() {
    $.ajax({
      	url: this.props.url,
      	dataType: 'json',
      	success: function(data) {
      		if (this.isMounted()) {
        		this.setState({data: data});
        	}
      	}.bind(this),
      	error: function(xhr, status, err) {
        	console.error(this.props.url, status, err.toString());
      		}.bind(this)
    	});
	},
	handleQuestionCreation: function(data) {
		console.log('(In QuestionBox) New Question' + data.id);
		// Get current data, add new question, set state
		var newData = this.state.data;
		newData.unshift(data);
		if (this.isMounted()) {
  		this.setState({data: newData});
  	}
	},
	handleLogIn: function(data) {
		console.log('(In QuestionBox) New User Authenticated ' + data.response.username);
		if (this.isMounted()) {
  		this.setState({currentUser: data});
  	}
	},
	handleResponse: function(data) {
		console.log('(In QuestionBox) Answer: ' + data.response.answer);
		// Get current data, add new answer, set state
		var newData = this.state.data;

    if(newData.response) {
  		newData.response.forEach(function(question) {
  			if(question.id == data.question) {
  				console.log('Pushed to ' + question.id)
  				question.answers.push(data);
  				question.isAnswered = true;
  			}
  		});
  		if (this.isMounted()) {
    		this.setState({data: newData});
    	}
    }
	},
	getInitialState: function() {
  	return {data: [], currentUser: null};
	},
	componentDidMount: function() {
  	this.loadQuestionsFromServer();
  	setInterval(this.loadQuestionsFromServer, this.props.pollInterval);
	},
	render: function() {
		var headerNode;
		var logInHidden;
		var askHidden;
		if (!this.state.currentUser) {
			logInHidden = false;
			askHidden = true;
		} else {
			logInHidden = true;
			askHidden = false;
		}
		return (
			<div className="questionBox">
				<LogInContainer isHidden={logInHidden} onLogIn={this.handleLogIn}/>
				<QuestionCreatorContainer isHidden={askHidden} onQuestionCreation={this.handleQuestionCreation} currentUser={this.state.currentUser} />
				<QuestionList 
          data={this.state.data} 
          onResponse={this.handleResponse} 
          currentUser={this.state.currentUser}/>
			</div>
		);
	}
});

var QuestionList = React.createClass({
	render: function() {
    console.log(this.props.data);
    if(this.props.data.response) {
  		var questionNodes = this.props.data.response.map(function (question) {
  			return (
  				<Question 
            questionText={question.text} 
            questionId={question.id} 
            username={question.asker.username} 
            firstName={question.asker.first_name} 
            answerList={question.options}
            avatarURL={question.asker.avatarUrl} 
            isAnswered={question.isAnswered} 
            answers={question.answers} 
            onResponse={this.props.onResponse} 
            currentUser={this.props.currentUser}/>
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
	render: function() {
		var answeredNode;
		if (this.props.isAnswered) {
			answeredNode = <IfAnswered />;
		}
		return (
			<div className="question">
				<QuestionHeader avatarURL={this.props.avatarURL} username={this.props.username} firstName={this.props.firstName} score={this.props.answers.length} />
				<QuestionContent onResponse={this.props.onResponse} questionText={this.props.questionText} questionId = {this.props.questionId} answerList={this.props.answerList} isAnswered={this.props.isAnswered} answers={this.props.answers} currentUser={this.props.currentUser}/>
				{answeredNode}
			</div>
		);
	}
});

var QuestionHeader = React.createClass({
	render: function() {
		var classString = 'questionHeader';
		if (this.props.isCondensed) {
			classString += ' condensed';
		}
		var avatarURL;
		if (this.props.avatarURL) {
			avatarURL = this.props.avatarURL;
		} else {
			avatarURL = "";
		}
		return (
			<div className={classString}>
				<img src={avatarURL} className="questionAvatar" />
				<div className="questionUsername">{this.props.firstName}</div>
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
		return (
			<div className="questionContent">
				<div className="questionText">{this.props.questionText}</div>
				<AnswerList answerList={this.props.answerList} questionId={this.props.questionId} onResponse={this.props.onResponse} isAnswered={this.props.isAnswered} answers={this.props.answers} currentUser={this.props.currentUser}/>
			</div>
		);
	}
});

var AnswerList = React.createClass({
  getInitialState: function() {
      return {
          stats: [0, 0, 0, 0, 0],
          piedata: piedata,
          isAnswered: false
      };
    },
	handleClick: function(index) {
		console.log("user clicked: " + index);

		var clickedAnswer = this.props.answerList[index];
		var JSONObj = { "user": 4, "question": this.props.questionId, "answer": index };
		var JSONStr = JSON.stringify(JSONObj);
		console.log('You clicked: ' + this.props.answerList[index]);
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
    $.ajax({
        url: GET_STATS_URL + this.props.questionId + "/",
        dataType: 'json',
        success: function(data) {
          var response = data.response;
          if (this.isMounted()) {
            statsArray = [response.quick.option1, response.quick.option2, response.quick.option3, response.quick.option4, response.quick.option5];
            this.setState({isAnswered: true, stats: statsArray});
            console.log(response.quick);
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
	},
	render: function() {
		return (
			<div className="answerList">
				<BarChart
                data={this.props.answerList}
                stats={this.state.stats}
                isAnswered={this.state.isAnswered}
                on_click_fn={this.handleClick}/>
			</div>
		);
	}
});

var Answer = React.createClass({
	handleResponse: function(index) {
		this.props.onResponse();
	},
	render: function() {
		var answer;
		if (this.props.isAnswered) {
			answer = <li><div className="answered"><p onClick={this.handleResponse.bind(this,this.props.index)}>{this.props.answerText}</p></div></li>;
		} else {
			answer = <li><p onClick={this.handleResponse.bind(this,this.props.index)}>{this.props.answerText}</p></li>;
		}
		return (
			<div>{answer}</div>
		);
	}
});

var IfAnswered = React.createClass({
	render: function() {
		return (
			<div className="ifAnswered">
				<DiscussionCard />
				<AnalysisCard />
				<div className="questionBottomMask" />
			</div>
		);
	}
});

var DiscussionCard = React.createClass({
	render: function() {
		return (
			<div className="discussionCard">Discussion Card</div>
		);
	}
});

var AnalysisCard = React.createClass({
	render: function() {
		return (
			<div className="analysisCard">Analysis Card</div>
		);
	}
});

// Question Creator
var QuestionCreatorContainer = React.createClass({
	render: function() {
		var className = "questionCreatorContainer"
		if (this.props.isHidden) {
			className = className + " condensed"
		}
		var avatarURL;
		var username;
		var firstName;
		var currentUser;
		if (currentUser = this.props.currentUser) {
			avatarURL = currentUser.avatarUrl;
			username = currentUser.username;
			firstName = currentUser.first_name;
		};
		return (
			<div className={className}>
				<QuestionCreator onQuestionCreation={this.props.onQuestionCreation} avatarURL={avatarURL} username={username} firstName={firstName} currentUser={this.props.currentUser}/>
			</div>
		);
	}
});

var QuestionCreator = React.createClass({
	getInitialState: function() {
		return {isCondensed: true};
	}, 
	handleClick: function(e) {
		this.setState({isCondensed: false});
		if (this.state.isCondensed) {
			document.questionCreatorForm.questionText.focus();
		};
		console.log(this.props.avatarURL);
	},
	handleSubmit: function(e) {
		this.setState({isCondensed: true});
	},
	render: function() {
		var creatorNode;
		if (this.state.isCondensed) {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarURL={this.props.avatarURL} username={this.props.username} firstName={this.props.firstName} score="0" isCondensed={true} condensedText="Ask a question..."/><QuestionCreatorContent isCondensed={true} onSubmit={this.handleSubmit} onQuestionCreation={this.props.onQuestionCreation} currentUser={this.props.currentUser}/></div>;
		} else {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarURL={this.props.avatarURL} username={this.props.username} firstName={this.props.firstName} score="0" isCondensed={false} condensedText="Ask a question..."/><QuestionCreatorContent isCondensed={false} onSubmit={this.handleSubmit} onQuestionCreation={this.props.onQuestionCreation} currentUser={this.props.currentUser}/></div>;
		}
		return (
			<div onClick={this.handleClick}>{creatorNode}</div>
		);
	}
});

// Log in
var LogInContainer = React.createClass({
	render: function() {
		var className = "logInContainer";
		if (this.props.isHidden) {
			className = className + " condensed"
		}
		return (
			<div className={className}>
				<LogInCreator onLogIn={this.props.onLogIn}/>
			</div>
		);
	}
});

var LogInCreator = React.createClass({
	getInitialState: function() {
		return {isCondensed: true};
	}, 
	handleClick: function(e) {
		this.setState({isCondensed: false});
		console.log('(In LogInCreator) clicked');
		if (this.state.isCondensed) {
			document.logInForm.logInUsername.focus();			
		};
	},
	handleSubmit: function(e) {
		this.setState({isCondensed: true});
	},
	render: function() {
		var creatorNode;
		if (this.state.isCondensed) {
			creatorNode = <div className="logInCreator"><QuestionHeader avatarURL="" username="Nathan" firstName="Nathan" score="0" isCondensed={true} condensedText="Click to Log In"/><LogInCreatorContent isCondensed={true} onSubmit={this.handleSubmit} onLogIn={this.props.onLogIn}/></div>;
		} else {
			creatorNode = <div className="logInCreator"><QuestionHeader avatarURL="" username="Nathan" firstName="Nathan" score="0" isCondensed={true} condensedText="Click to Log In"/><LogInCreatorContent isCondensed={false} onSubmit={this.handleSubmit} onLogIn={this.props.onLogIn}/></div>;
		}
		return (
			<div onClick={this.handleClick}>{creatorNode}</div>
		);
	}
});

var App = React.createClass({
	render: function() {
		return (
			<div className="body">
				<div className="Title"><h1><i className="fa fa-tree"></i></h1></div>
				<QuestionBox url={GET_QUESTION_URL} pollInterval={200000}/>
			</div>
    	);
  	}
});

module.exports = App;