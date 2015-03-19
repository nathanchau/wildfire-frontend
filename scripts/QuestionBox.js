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

var fakeIsAnswered = [];

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
	render: function() {
	    if(this.props.data.response) {
	  		var questionNodes = this.props.data.response.popularQuestions.map(function (questionObj, index) {
	        	if(fakeIsAnswered.length < this.props.data.response.popularQuestions.length) {
	        	  	fakeIsAnswered.push(-1);
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
          score={this.state.questionObj.answers.length} id={this.state.questionObj.asker.id} categories={this.state.questionObj.categories}/>
				
        <QuestionContent 
          index={this.props.index}
          questionType={this.state.questionObj.questionType}
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
    var categoryText;
    if (typeof this.props.categories != 'undefined' && this.props.categories.length > 0) {
    	categoryText = "asked about " + this.props.categories.join(", ");
    } else {
    	categoryText = "asked";
    }
    return (
      <div className={classString}>
        <a href={"/profile/"+this.props.id}>
        <img src={avatarUrl} className="questionAvatar" />
        <div className="questionUsername">{this.props.first_name}</div>
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
            isAnswered={this.props.isAnswered} 
            answers={this.props.answers} 
            currentUser={this.props.currentUser}
            onResponse={this.props.onResponse} />
          break;
      case "RG":
          answerNode=<RangeSliderAnswer
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
  getInitialState: function() {
    return {
        stats: null,
        piedata: piedata,
        isAnswered: fakeIsAnswered[this.props.index]
    };
  },
  componentDidMount: function() {
  	if(this.state.isAnswered >= 0) {
  		this.getStats(this.state.isAnswered);
  	}
  },
  detailsClick: function() {
    if(this.state.isAnswered >= 0 && this.state.stats) {
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
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
        }.bind(this)
      });
		this.getStats(index);
    console.log("after ajax post: fakeIsAnswered = " + fakeIsAnswered);
	},
	getStats: function(index) {
		$.ajax({
        url: GET_STATS_URL + this.props.questionId + "/",
        dataType: 'json',
        success: function(data) {
          var response = data.response;
          if (this.isMounted()) {
            statsArray = [response.quick.option1, response.quick.option2, response.quick.option3, response.quick.option4, response.quick.option5];
            fakeIsAnswered[this.props.index] = index;
            this.setState({isAnswered: fakeIsAnswered[this.props.index], stats: statsArray});
          }
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(url, status, err.toString());
          }.bind(this)
      });
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

var RangeSliderAnswer = React.createClass({
  getInitialState: function() {
    return {
      statsAvg: null, 
      curValue: 0,
      isAnswered: fakeIsAnswered[this.props.index]
    };
  },
  onSlideFn: function(value) {
    this.setState({curValue: value});
  },
  detailsClick: function() {
    if(this.state.isAnswered >= 0 && this.state.statsAvg) {
      console.log("going to detailed stats");
      navigate('/detailedStats/' + this.props.questionId);
    }
  },
  postAnswer: function() {
    var JSONObj = { "user": 4, "question": this.props.questionId, "answer": this.state.curValue };
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
    console.log("after ajax post: fakeIsAnswered = " + fakeIsAnswered);
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
            fakeIsAnswered[this.props.index] = this.state.curValue;
            this.setState({isAnswered: fakeIsAnswered[this.props.index], statsAvg: response.avg});
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