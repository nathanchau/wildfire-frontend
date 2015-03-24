var React = require('react');

//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var DetailedStats = require('./DetailedStats');

//Quick view
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');
var RangeSlider = require('./RangeSlider');

var LogInCreatorContent = require('./LogInCreatorContent');
var QuestionCreatorContent = require('./QuestionCreatorContent');

// URLs
var POST_ANSWER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";

var sampleStats = [5, 10, 20, 65, 0];//, 10, 15, 10, 20, 50, 75, 20, 10, 5];
var piedata = [ {name: "one", value: 10375},
      {name: "two", value:  7615},
      {name: "three", value:  832},
      {name: "four", value:  516},
      {name: "five", value:  491} ];

var QuestionBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
	loadQuestionsFromServer: function() {
	console.log("loading questions from server");
    $.ajax({
      	url: this.props.url,
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
        		this.setState({data: data});
        	}
    		// Check if user is currently logged in - if so, set to currentUser
    		console.log("currentUser is " + data.user);
    		if (data.user && this.isMounted()) {
    			this.props.onLogIn(data.user);
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
	handleResponse: function(questionId, answer, currentUserId) {var JSONObj = { "user": currentUserId, "question": questionId, "answer": answer };
    var JSONStr = JSON.stringify(JSONObj);
    console.log('User ' + currentUserId + ' answered question ' + questionId + ' with answer ' + answer);
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
          console.error(url, status, err.toString());
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
	componentDidMount: function() {
  	this.loadQuestionsFromServer();
  	setInterval(this.loadQuestionsFromServer, this.props.pollInterval);
	},
	render: function() {
		var headerNode;
		var logInHidden;
		var askHidden;
		if (!this.props.currentUser.id) {
			logInHidden = false;
			askHidden = true;
		} else {
			logInHidden = true;
			askHidden = false;
		}
		return (
			<div className="questionBox">
				<LogInContainer isHidden={logInHidden} onLogIn={this.props.onLogIn}/>
				<QuestionCreatorContainer isHidden={askHidden} onQuestionCreation={this.handleQuestionCreation} currentUser={this.props.currentUser} />
				<QuestionList 
          data={this.state.data} 
          currentUser={this.props.currentUser}
          onResponse={this.handleResponse} />
			</div>
		);
	}
});

var QuestionList = React.createClass({
  componentDidUpdate: function() {
    console.log("qlist did update");
    console.log(this.props.data);
  },
	render: function() {
	    if(this.props.data.response) {
	  		var questionNodes = this.props.data.response.popularQuestions.map(function (question, index) {
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
	render: function() {
		var answeredNode;
		return (
			<div className="question">
			  <QuestionHeader QuestionHeader avatarUrl={this.props.avatarUrl} username={this.props.username} firstName={this.props.firstName} score={this.props.answers.length} categories={this.props.categories}/>
				
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
        {this.props.usersAnswer ? <button onClick={this.detailsClick}>See statistics</button> : null}
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

module.exports = QuestionBox;