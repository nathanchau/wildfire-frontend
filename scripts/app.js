'use strict';

var React = require('react');

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
 
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadQuestionsFromServer();
    setInterval(this.loadQuestionsFromServer, this.props.pollInterval);
  },
	render: function() {
		return (
			<div className="questionBox">
				<QuestionList data={this.state.data} answerUrl={this.props.answerUrl}/>
			</div>
		);
	}
});

var QuestionList = React.createClass({
	render() {
		var answerUrl = this.props.answerUrl;
		var questionNodes = this.props.data.map(function (question) {
			return (
				<Question questionText={question.text} questionId = {question.id} username={question.asker.username} answerList={question.options} answerUrl={answerUrl} avatarURL={question.asker.avatarUrl} isAnswered={false}/>
			);
		});
		return (
			<div className="questionList">
				{questionNodes}
			</div>
		);
	}
});

var Question = React.createClass({
	getInitialState() {
		return {isAnswered: this.props.isAnswered};
	},
	handleResponse(e) {
		if (this.isMounted()) {
			this.setState({isAnswered: true});
		}
	},
	render() {
		var answeredNode;
		if (this.state.isAnswered) {
			answeredNode = <IfAnswered />;
		}
		return (
			<div className="question">
				<QuestionHeader avatarURL={this.props.avatarURL} username={this.props.username} score="240" />
				<QuestionContent onResponse={this.handleResponse} questionText={this.props.questionText} answerUrl={this.props.answerUrl} questionId = {this.props.questionId} answerList={this.props.answerList} />
				{answeredNode}
			</div>
		);
	}
});

var QuestionHeader = React.createClass({
	render() {
		return (
			<div className="questionHeader">
				<img src={this.props.avatarURL} className="questionAvatar" />
				<div className="questionUsername">{this.props.username}</div>
				<div className="questionCategory">asked about Philosophy</div>
				<div className="questionScore">{this.props.score}</div>
				<div className="questionScoreAccessory">answered</div>
			</div>
		);
	}
});

var QuestionContent = React.createClass({
	render() {
		return (
			<div className="questionContent">
				<div className="questionText">{this.props.questionText}</div>
				<AnswerList answerList={this.props.answerList} questionId={this.props.questionId} answerUrl = {this.props.answerUrl} onResponse={this.props.onResponse}/>
			</div>
		);
	}
});

var AnswerList = React.createClass({
	handleClick: function(index) {
		var clickedAnswer = this.props.answerList[index];
		var JSONObj = { "user": 5, "question": this.props.questionId, "answer": index };
		var JSONStr = JSON.stringify(JSONObj);
		console.log('You clicked: ' + this.props.answerList[index]);
		$.ajax({
        url: this.props.answerUrl,
        dataType: 'json',
        type: 'POST',
        data: JSONStr,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.answerUrl, status, err.toString());
        }.bind(this)
      });
	},
	render: function() {
		var answerNodes = this.props.answerList.map(function(answer, i) {
			return (
				<div className="answer" onClick={this.handleClick.bind(this, i)} key={i}>
					<Answer onResponse={this.props.onResponse} answerText={answer} />
				</div>
			);
		}.bind(this));
		return (
			<div className="answerList">
				<ol type="a">
					{answerNodes}
				</ol>
			</div>
		);
	}
});

var Answer = React.createClass({
	getInitialState() {
		return {isAnswered: false};
	},
	handleResponse(e) {
		this.props.onResponse();
		if (this.isMounted()) {
			this.setState({isAnswered: true});
		}
	},
	render() {
		var answer;
		if (this.state.isAnswered) {
			answer = <li><div className="answered"><p onClick={this.handleResponse}>{this.props.answerText}</p></div></li>;
		} else {
			answer = <li><p onClick={this.handleResponse}>{this.props.answerText}</p></li>;
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

var App = React.createClass({
	render() {
		return (
			<div className="body">
				<div className="Title"><h1><i className="fa fa-tree"></i> Wildfire</h1></div>
				<QuestionBox url="https://hidden-castle-6417.herokuapp.com/wildfire/question/" answerUrl = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/" pollInterval={2000}/>
			</div>
    	);
  	}
});

module.exports = App;