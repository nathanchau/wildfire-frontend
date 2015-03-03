'use strict';
require('./base.css');
require('./expanding');
require('jquery');

var React = require('react');
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');

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
  	handleQuestionCreation(data) {
  		console.log('(In QuestionBox) New Question' + data.id);
		// Get current data, add new question, set state
		var newData = this.state.data;
		newData.unshift(data);
  		if (this.isMounted()) {
    		this.setState({data: newData});
    	}
  	},
  	handleLogIn(data) {
  		console.log('(In QuestionBox) New User Authenticated ' + data.username);
  		if (this.isMounted()) {
    		this.setState({currentUser: data});
    	}
  	},
  	handleResponse(data) {
		console.log('(In QuestionBox) Answer: ' + data.answer);
		// Get current data, add new answer, set state
		var newData = this.state.data;
		newData.forEach(function(question) {
			if(question.id == data.question) {
				console.log('Pushed to ' + question.id)
				question.answers.push(data);
				question.isAnswered = true;
			}
		});
  		if (this.isMounted()) {
    		this.setState({data: newData});
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
				<QuestionList data={this.state.data} answerUrl={this.props.answerUrl} onResponse={this.handleResponse} currentUser={this.state.currentUser}/>
			</div>
		);
	}
});

var QuestionList = React.createClass({
	render() {
		var answerUrl = this.props.answerUrl;
		var questionNodes = this.props.data.map(function (question) {
			return (
				<Question questionText={question.text} questionId = {question.id} username={question.asker.username} firstName={question.asker.first_name} answerList={question.options} answerUrl={answerUrl} avatarURL={question.asker.avatarUrl} isAnswered={question.isAnswered} answers={question.answers} onResponse={this.props.onResponse} currentUser={this.props.currentUser}/>
			);
		}.bind(this));
		return (
			<div className="questionList">
				{questionNodes}
			</div>
		);
	}
});

var Question = React.createClass({
	render() {
		var answeredNode;
		if (this.props.isAnswered) {
			answeredNode = <IfAnswered />;
		}
		return (
			<div className="question">
				<QuestionHeader avatarURL={this.props.avatarURL} username={this.props.username} firstName={this.props.firstName} score={this.props.answers.length} />
				<QuestionContent onResponse={this.props.onResponse} questionText={this.props.questionText} answerUrl={this.props.answerUrl} questionId = {this.props.questionId} answerList={this.props.answerList} isAnswered={this.props.isAnswered} answers={this.props.answers} currentUser={this.props.currentUser}/>
				{answeredNode}
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
	render() {
		return (
			<div className="questionContent">
				<div className="questionText">{this.props.questionText}</div>
				<AnswerList answerList={this.props.answerList} questionId={this.props.questionId} answerUrl = {this.props.answerUrl} onResponse={this.props.onResponse} isAnswered={this.props.isAnswered} answers={this.props.answers} currentUser={this.props.currentUser}/>
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
        url: this.props.answerUrl,
        dataType: 'json',
        type: 'POST',
        data: JSONStr,
        success: function(data) {
        	this.props.onResponse(data);
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.answerUrl, status, err.toString());
        }.bind(this)
      });
    $.ajax({
        url: "https://hidden-castle-6417.herokuapp.com/wildfire/stats/" + this.props.questionId + "/",
        dataType: 'json',
        success: function(data) {
          if (this.isMounted()) {
            statsArray = [data.quick.option1, data.quick.option2, data.quick.option3, data.quick.option4, data.quick.option5];
            this.setState({isAnswered: true, stats: statsArray});
            console.log(data.quick);
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
	},
	render: function() {
		// If Answered, then need to highlight one of the options as answered
		/*var answerIndex;
		if (this.props.isAnswered) {
			// Find current user's answer object
			var answerMap = this.props.answers.map(function(answer, i) {
				// Check for each if userid matches current
				if (this.props.currentUser && answer.user == this.props.currentUser.id) {
					answerIndex = answer.answer;
					return answer.answer;
				}
			}.bind(this));
		}
		var answerNodes = this.props.answerList.map(function(answer, i) {
			var isAnswered = false;
			if (this.props.isAnswered && answerIndex == i) {
				isAnswered = true;
			}
			return (
				<div className="answer" key={i}>
					<Answer onResponse={this.handleClick.bind(this, i)} answerText={answer} index={i} isAnswered={isAnswered}/>
				</div>
			);
		}.bind(this));*/
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
	handleResponse(index) {
		this.props.onResponse();
	},
	render() {
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
	render() {
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
	render() {
		return (
			<div className="discussionCard">Discussion Card</div>
		);
	}
});

var AnalysisCard = React.createClass({
	render() {
		return (
			<div className="analysisCard">Analysis Card</div>
		);
	}
});

// Question Creator
var QuestionCreatorContainer = React.createClass({
	render() {
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
	getInitialState() {
		return {isCondensed: true};
	}, 
	handleClick(e) {
		this.setState({isCondensed: false});
		if (this.state.isCondensed) {
			document.questionCreatorForm.questionText.focus();
		};
		console.log(this.props.avatarURL);
	},
	handleSubmit(e) {
		this.setState({isCondensed: true});
	},
	render() {
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

var QuestionCreatorContent = React.createClass({
	handleSubmit(e) {
		e.preventDefault();
		if (this.state.isValidated) {
			this.props.onSubmit();
			this.setState({isValidated: false});

			var options = [this.refs.answer1.getDOMNode().value];
			if (this.refs.answer2.getDOMNode().value != '') {
				options.push(this.refs.answer2.getDOMNode().value);
			} 
			if (this.refs.answer3.getDOMNode().value != '') {
				options.push(this.refs.answer3.getDOMNode().value);
			} 
			if (this.refs.answer4.getDOMNode().value != '') {
				options.push(this.refs.answer4.getDOMNode().value);
			} 
			if (this.refs.answer5.getDOMNode().value != '') {
				options.push(this.refs.answer5.getDOMNode().value);
			}

			var JSONObj = { "asker": this.props.currentUser.id, "questionType": 'MC', "text": this.refs.question.getDOMNode().value, "options": options};
			var JSONStr = JSON.stringify(JSONObj);

			$.ajax({
	        	url: "https://hidden-castle-6417.herokuapp.com/wildfire/question/create/",
	        	dataType: 'json',
	        	type: 'POST',
	        	data: JSONStr,
	        	success: function(data) {
	          		//this.setState({data: data});
	          		this.props.onQuestionCreation(data);
	        	}.bind(this),
	        	error: function(xhr, status, err) {
	        	  	console.error(status, err.toString());
	        	}.bind(this)
	      	});

	    	this.refs.question.getDOMNode().value = '';
	    	this.refs.answer1.getDOMNode().value = '';
	    	this.refs.answer2.getDOMNode().value = '';
	    	this.refs.answer3.getDOMNode().value = '';
	    	this.refs.answer4.getDOMNode().value = '';
	    	this.refs.answer5.getDOMNode().value = '';
		}
	},
	getInitialState() {
		return {isValidated:false};
	},
	handleInput(e) {
		if (this.refs.question.getDOMNode().value != '' && this.refs.answer1.getDOMNode().value != '') {
			this.setState({isValidated: true});
		} else {
			this.setState({isValidated: false});
		}
	},
	render() {
		var classString = 'questionCreatorContent';
		if (this.props.isCondensed) {
			classString += ' condensed';
		} else if (this.state.isValidated) {
			classString += ' validated';
		}
		return (
			<div className={classString}>
				<form className="questionCreatorForm" name="questionCreatorForm" onSubmit={this.handleSubmit} onInput={this.handleInput}>
				<textarea className="expanding questionCreatorText" name="questionText" placeholder="Ask a question..." rows="1" ref="question"></textarea>

				<div className="questionCreatorAnswerList" id="questionCreatorAnswerList">
					<ol type="a">
						<div className="questionCreatorAnswerListElement">
							<li><textarea className="expanding questionCreatorAnswer" name="answer" placeholder="Add an answer" rows="1" onChange={this.handleChange} ref="answer1"></textarea></li>
						</div>
						<div className="questionCreatorAnswerListElement">
							<li><textarea className="expanding questionCreatorAnswer" name="answer" placeholder="Add another answer" rows="1" onChange={this.handleChange} ref="answer2"></textarea></li>
						</div>
						<div className="questionCreatorAnswerListElement">
							<li><textarea className="expanding questionCreatorAnswer" name="answer" placeholder="Maybe another answer" rows="1" onChange={this.handleChange} ref="answer3"></textarea></li>
						</div>
						<div className="questionCreatorAnswerListElement">
							<li><textarea className="expanding questionCreatorAnswer" name="answer" placeholder="Yet another answer" rows="1" onChange={this.handleChange} ref="answer4"></textarea></li>
						</div>
						<div className="questionCreatorAnswerListElement">
							<li><textarea className="expanding questionCreatorAnswer" name="answer" placeholder="Last answer" rows="1" onChange={this.handleChange} ref="answer5"></textarea></li>
						</div>
					</ol>
				</div>

				<button className="questionCreatorButton" type="submit" value="Ask this question">Ask this question <i className="fa fa-paper-plane-o"></i></button>

				</form>
			</div>
		);
	}
});

// Log in
var LogInContainer = React.createClass({
	render() {
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
	getInitialState() {
		return {isCondensed: true};
	}, 
	handleClick(e) {
		this.setState({isCondensed: false});
		console.log('(In LogInCreator) clicked');
		if (this.state.isCondensed) {
			document.logInForm.logInUsername.focus();			
		};
	},
	handleSubmit(e) {
		this.setState({isCondensed: true});
	},
	render() {
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

var LogInCreatorContent = React.createClass({
	handleSubmit(e) {
		e.preventDefault();
		if (this.state.isValidated) {
			this.props.onSubmit();
			this.setState({isValidated: false});

			var username = this.refs.username.getDOMNode().value;
			var password = this.refs.password.getDOMNode().value;
			var reqData = "username=" + username + "&password=" + password;

			$.ajax({
	        	url: "https://hidden-castle-6417.herokuapp.com/wildfire/login/",
	        	dataType: 'HTML',
	        	type: 'POST',
	        	data: reqData,
	        	success: function(data) {
	          		//this.setState({data: data});
	          		this.props.onLogIn(JSON.parse(data));
	        	}.bind(this),
	        	error: function(xhr, status, err) {
	        	  	console.error(status, err.toString());
	        	}.bind(this)
	      	});

	    	this.refs.username.getDOMNode().value = '';
	    	this.refs.password.getDOMNode().value = '';
		}
	},
	getInitialState() {
		return {isValidated:false};
	},
	handleInput(e) {
		if (this.refs.username.getDOMNode().value != '' && this.refs.password.getDOMNode().value != '') {
			this.setState({isValidated: true});
		} else {
			this.setState({isValidated: false});
		}
	},
	render() {
		var classString = 'logInCreatorContent';
		if (this.props.isCondensed) {
			classString += ' condensed';
		} else if (this.state.isValidated) {
			classString += ' validated';
		}
		return (
			<div className={classString}>
				<form className="logInCreatorForm" name="logInForm" onSubmit={this.handleSubmit} onInput={this.handleInput}>
				<textarea className="expanding logInCreatorText" name="logInUsername" placeholder="Username &#xF0E7;" rows="1" ref="username"></textarea>
				<textarea className="expanding logInCreatorText" name="logInPassword" placeholder="Password &#xF21B;" rows="1" ref="password"></textarea>

				<button className="logInCreatorButton" type="submit" value="Log In">Log In <i className="fa fa-tree"></i></button>

				</form>
			</div>
		);
	}
});

var App = React.createClass({
	render() {
		return (
			<div className="body">
				<div className="Title"><h1><i className="fa fa-tree"></i></h1></div>
				<QuestionBox url="https://hidden-castle-6417.herokuapp.com/wildfire/question/" answerUrl = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/" pollInterval={200000}/>
			</div>
    	);
  	}
});

module.exports = App;