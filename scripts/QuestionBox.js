var React = require('react');

//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var DetailedStats = require('./DetailedStats');

//Quick view
var BarChart = require('./BarChart');
var PieChart = require('./PieChart');

var LogInContainer = require('./LogInContainer');
var QuestionCreatorContent = require('./QuestionCreatorContent');
var ReusableSlider = require('./ReusableSlider');
// URLs
var POST_ANSWER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/";
var GET_STATS_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/stats/";

// Social
var FacebookButton = require("../node_modules/react-social").FacebookButton;
var TwitterButton = require("../node_modules/react-social").TwitterButton;

var rangeStats = {"response":{"region":[{"answer__avg":1.0,"user__region":"en_US"},{"answer__avg":7.0,"user__region":"USA"}],"male":{"avg":5.0,"responses":[{"answer":1},{"answer":9}]},"quick":{"avg":5.0,"responses":[{"answer":1},{"answer":5},{"answer":9}]},"female":{"avg":5.0,"responses":[{"answer":5}]}},"user":null};

var QuestionBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
	loadQuestionsFromServer: function() {
	console.log("loading questions from server");
  console.log("Temp Token is " + this.props.tempToken);
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
      		} else if (this.props.tempToken) {
            // Immediately after logging in, cookies not accessible - allows us to authenticate in this case
            xhr.setRequestHeader("Authorization", "Token " + this.props.tempToken);
          }
      	}.bind(this),
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
  handleLogIn: function(data) {
    console.log("(In QuestionBox) Set Token");
    this.props.onLogIn(data);
    this.loadQuestionsFromServer();
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
  	//setInterval(this.loadQuestionsFromServer, this.props.pollInterval);
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
				<LogInContainer isHidden={logInHidden} onLogIn={this.handleLogIn}/>
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
	  				<Question onResponse={this.props.onResponse} index={index} questionText={question.text} questionType={question.questionType} questionId = {question.id} username={question.asker.username} firstName={question.asker.first_name} userId={question.asker.id} answerList={question.options} answerUrl={POST_ANSWER_URL} avatarUrl={question.asker.avatarUrl} answerOptions={question.options} currentUser={this.props.currentUser} categories={question.categories} stats={question.quick} usersAnswer={question.usersAnswer} answers={question.answers}/>
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
		return (
			<div className="question">
			  <QuestionHeader QuestionHeader avatarUrl={this.props.avatarUrl} id={this.props.currentUser.id} username={this.props.username} firstName={this.props.firstName} score={this.props.answers.length} categories={this.props.categories} userId={this.props.userId}/>
				
        <QuestionContent 
          index={this.props.index} onResponse={this.props.onResponse} questionType={this.props.questionType} questionText={this.props.questionText} answerUrl={this.props.answerUrl} questionId = {this.props.questionId} answerOptions={this.props.answerOptions} currentUserId={this.props.currentUser.id} stats={this.props.stats} usersAnswer={this.props.usersAnswer}/>
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
        <a href={"/profile/"+this.props.userId}>
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
    console.log(this.props.currentUser);
    var answerNode;
    switch(this.props.questionType) {
      case "MC":
          answerNode=<AnswerList 
            index={this.props.index}
            questionType={this.props.questionType}
            answerOptions={this.props.answerOptions} 
            questionId={this.props.questionId}
            answers={this.props.answers} 
            currentUserId={this.props.currentUserId}
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
            currentUserId={this.props.currentUserId}
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
    this.props.onResponse(this.props.questionId, index, this.props.currentUserId);
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
        {this.props.usersAnswer ? <span className="buttonWrapper"><FacebookButton className="facebookButton" url={"askwildfire.com/detailedStats/" + this.props.questionId}><i className="fa fa-facebook fa-lg"></i></FacebookButton><TwitterButton className="twitterButton" url={"askwildfire.com/detailedStats/" + this.props.questionId}><i className="fa fa-twitter fa-lg"></i></TwitterButton><button className="detailedStatsButton" onClick={this.detailsClick}><i className="fa fa-pie-chart fa-lg"></i> See statistics</button></span> : null}
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
    console.log("userid = " + this.props.currentUserId);
    this.props.onResponse(this.props.questionId, slideValue, this.props.currentUserId);
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
    console.log(handlesToDisplay);
    return (
      <div className="answerList">
        <ReusableSlider bounds={bounds} width={this.state.width} onSubmit={this.handleSubmit} handlesToDisplay={handlesToDisplay}/>
        {this.props.usersAnswer ? <button className="detailedStatsButton" onClick={this.detailsClick}>See statistics</button> : null}
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
			creatorNode = <div className="questionCreator"><QuestionHeader avatarUrl={this.props.avatarUrl} username={this.props.username} firstName={this.props.first_name} score="0" isCondensed={true} condensedText="Ask a question..."/><QuestionCreatorContent isCondensed={true} onSubmit={this.handleSubmit} onQuestionCreation={this.props.onQuestionCreation} currentUser={this.props.currentUser}/></div>;
		} else {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarUrl={this.props.avatarUrl} username={this.props.username} firstName={this.props.first_name} score="0" isCondensed={false} condensedText="Ask a question..."/><QuestionCreatorContent isCondensed={false} onSubmit={this.handleSubmit} onQuestionCreation={this.props.onQuestionCreation} currentUser={this.props.currentUser}/></div>;
		}
		return (
			<div onClick={this.handleClick}>{creatorNode}</div>
		);
	}
});

module.exports = QuestionBox;