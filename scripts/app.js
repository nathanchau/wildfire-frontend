'use strict';
require('./base.css');
require('./expanding');
require('jquery');

var React = require('react');

//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var DetailedStats = require('./DetailedStats');

//Quick view
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');

var LogInCreatorContent = require('./LogInCreatorContent');
var QuestionCreatorContent = require('./QuestionCreatorContent');

// URLs
var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";
var POST_ANSWER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";

var sampleStats = [5, 10, 20, 65, 0];//, 10, 15, 10, 20, 50, 75, 20, 10, 5];
var piedata = [ {name: "one", value: 10375},
      {name: "two", value:  7615},
      {name: "three", value:  832},
      {name: "four", value:  516},
      {name: "five", value:  491} ];

var fakeIsAnswered = [];

var QuestionBox = React.createClass({
  getInitialState: function() {
    return {data: [], currentUser: null};
  },
	loadQuestionsFromServer: function() {
    $.ajax({
      	url: this.props.url,
      	dataType: 'json',
      	success: function(data) {
      		if (this.isMounted()) {
        		this.setState({data: data});
        	}
    		// Check if user is currently logged in - if so, set to currentUser
    		console.log("currentUser is " + data.user);
    		if (data.user != "Anonymous" && this.isMounted()) {
    			this.setState({currentUser: data.user});
    		}
      	}.bind(this),
      	error: function(xhr, status, err) {
        	console.error(this.props.url, status, err.toString());
      		}.bind(this)
    	});
	},
	handleQuestionCreation: function(data) {
		console.log('(In QuestionBox) New Question ' + data.id);
		// Get current data, add new question, set state
		var newData = this.state.data;
		console.log(newData.response.popularQuestions.length);
		newData.response.popularQuestions.unshift(data);
		console.log(newData.response.popularQuestions.length);
		if (this.isMounted()) {
			console.log("Mounted and setting new state");
  			this.setState({data: newData});
  		}
	},
	handleLogIn: function(data) {
		console.log('(In QuestionBox) New User Authenticated ' + data.username);
		if (this.isMounted()) {
  		this.setState({currentUser: data});
  	}
	},
  /*NOT BEING USED*/
	handleResponse: function(data) {
		//console.log('(In QuestionBox) Answer: ' + data.response.answer); //TODO: server NOT ANSWERING YET
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
    		//this.setState({data: newData});
    	}
    }
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
          currentUser={this.state.currentUser}
          onResponse={this.handleResponse} />
			</div>
		);
	}
});

var QuestionList = React.createClass({
	render: function() {
	    if(this.props.data.response) {
	  		var questionNodes = this.props.data.response.popularQuestions.map(function (questionObj, index) {
	        	if(fakeIsAnswered.length < this.props.data.response.length) {
	        	  	fakeIsAnswered.push(false);
	        	}
	  			return (
	  				<Question index = {index} questionObj={questionObj} onResponse={this.props.onResponse} />
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
  getInitialState: function() {
    return {questionObj: this.props.questionObj};
  },
  handleResponse: function(data) {
    //console.log('(In QuestionBox) Answer: ' + data.response.answer); //TODO: server NOT ANSWERING YET
    // Get current data, add new answer, set state
    var newData = this.state.questionObj;

    if(newData) {
      console.log('Pushed to ' + this.state.questionObj.id);
      this.state.questionObj.answers.push(data);
    }
    if (this.isMounted()) {
      //this.setState({questionObj: newData});
    }
  },
	render: function() {
		var answeredNode;
    //console.log(this.state.questionObj.asker);
		if (this.state.questionObj.isAnswered) {
			//answeredNode = <IfAnswered />;
		}
		return (
			<div className="question">
			  <QuestionHeader 
          avatarUrl={this.state.questionObj.asker.avatarUrl} 
          username={this.state.questionObj.asker.username} 
          first_name={this.state.questionObj.asker.first_name} 
          score={this.state.questionObj.answers.length} />
				
        <QuestionContent 
          index={this.props.index}
          questionText={this.state.questionObj.text} 
          questionId = {this.state.questionObj.id} 
          answerOptions={this.state.questionObj.options} 
          isAnswered={this.state.questionObj.isAnswered} 
          answers={this.state.questionObj.answers} 
          currentUser={this.props.currentUser}
          onResponse={this.handleResponse} />
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
          onResponse={this.props.onResponse} />
			</div>
		);
	}
});

var AnswerList = React.createClass({
  getInitialState: function() {
      return {
          stats: null,
          piedata: piedata,
          isAnswered: fakeIsAnswered[this.props.index]
      };
    },
  detailsClick: function() {
    if(this.state.isAnswered && this.state.stats) {
      console.log("going to detailed stats");
      navigate('/detailedStats/' + this.props.questionId);
    }
  },
	handleClick: function(index) {
		console.log("isAnswered" + this.state.isAnswered);
		var clickedAnswer = this.props.answerOptions[index];
		var JSONObj = { "user": 4, "question": this.props.questionId, "answer": index };
		var JSONStr = JSON.stringify(JSONObj);
		console.log('You clicked: ' + this.props.answerOptions[index]);
		$.ajax({
        url: POST_ANSWER_URL,
        dataType: 'json',
        type: 'POST',
        data: JSONStr,
        success: function(data) {
        	this.props.onResponse(data);
          //fakeIsAnswered[this.props.index] = true;
          //this.setState({isAnswered: fakeIsAnswered[this.props.index]});
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
            fakeIsAnswered[this.props.index] = true;
            this.setState({isAnswered: fakeIsAnswered[this.props.index], stats: statsArray});
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
    console.log("after ajax post: fakeIsAnswered = " + fakeIsAnswered);
	},
	render: function() {
    //console.log(this.props.answerOptions);
		return (
			<div className="answerList" onClick={this.detailsClick}>
				<BarChart 
                data={this.props.answerOptions}
                stats={this.state.stats}
                isAnswered={fakeIsAnswered[this.props.index]}
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

/*var IfAnswered = React.createClass({
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
});*/

// Question Creator
var QuestionCreatorContainer = React.createClass({
	render: function() {
		var className = "questionCreatorContainer"
		if (this.props.isHidden) {
			className = className + " condensed"
		}
		var avatarUrl;
		var username;
		var first_name;
		var currentUser;
		if (currentUser = this.props.currentUser) {
			avatarUrl = currentUser.avatarUrl;
			username = currentUser.username;
			first_name = currentUser.first_name;
		};
		return (
			<div className={className}>
				<QuestionCreator onQuestionCreation={this.props.onQuestionCreation} avatarUrl={avatarUrl} username={username} first_name={first_name} currentUser={this.props.currentUser}/>
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
	},
	handleSubmit: function(e) {
		this.setState({isCondensed: true});
	},
	render: function() {
		var creatorNode;
		if (this.state.isCondensed) {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarUrl={this.props.avatarUrl} username={this.props.username} first_name={this.props.first_name} score="0" isCondensed={true} condensedText="Ask a question..."/><QuestionCreatorContent isCondensed={true} onSubmit={this.handleSubmit} onQuestionCreation={this.props.onQuestionCreation} currentUser={this.props.currentUser}/></div>;
		} else {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarUrl={this.props.avatarUrl} username={this.props.username} first_name={this.props.first_name} score="0" isCondensed={false} condensedText="Ask a question..."/><QuestionCreatorContent isCondensed={false} onSubmit={this.handleSubmit} onQuestionCreation={this.props.onQuestionCreation} currentUser={this.props.currentUser}/></div>;
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
			creatorNode = <div className="logInCreator"><QuestionHeader avatarUrl="" username="Nathan" first_name="Nathan" score="0" isCondensed={true} condensedText="Click to Log In"/><LogInCreatorContent isCondensed={true} onSubmit={this.handleSubmit} onLogIn={this.props.onLogIn}/></div>;
		} else {
			creatorNode = <div className="logInCreator"><QuestionHeader avatarUrl="" username="Nathan" first_name="Nathan" score="0" isCondensed={true} condensedText="Click to Log In"/><LogInCreatorContent isCondensed={false} onSubmit={this.handleSubmit} onLogIn={this.props.onLogIn}/></div>;
		}
		return (
			<div onClick={this.handleClick}>{creatorNode}</div>
		);
	}
});

var HomePage = React.createClass({
	render: function() {
		return (
			<div className="body">
				<div className="Title"><img className="logo" src="../images/wildfire-logo.png"/></div>
				<QuestionBox url={GET_QUESTION_URL} pollInterval={200000}/>
			</div>
    	);
  	}
});

var App = React.createClass({

    mixins: [RouterMixin],

    routes: {
        '/': 'home',
        '/message/:text': 'message',
        '/detailedStats/:id' : 'detailedStats'
    },

    render: function() {
        return this.renderCurrentRoute();
    },

    home: function() {
        return <HomePage/>;
    },

    message: function(text) {
        return <div>{text}</div>;
    },

    detailedStats: function(id) {
        return <DetailedStats id={id} data={piedata}/>;
    },

    notFound: function(path) {
        return <div class="not-found">Page Not Found: {path}</div>;
    }

});

module.exports = App;