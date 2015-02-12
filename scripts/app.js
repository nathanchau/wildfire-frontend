'use strict';

var React = require('react');

var QuestionBox = React.createClass({
	loadQuestionsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
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
				<QuestionList data={this.state.data}/>
			</div>
		);
	}
});

var QuestionList = React.createClass({
	render() {
		var questionNodes = this.props.data.map(function (question) {
			return (
				<Question questionText={question.text} username={question.asker.username} answerList={question.options} isAnswered={false} />
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
		this.setState({isAnswered: true});
	},
	render() {
		var answeredNode;
		if (this.state.isAnswered) {
			answeredNode = <IfAnswered />;
		}
		return (
			<div className="question">
				<QuestionHeader avatarURL="https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xpa1/t51.2885-19/10369526_1488926638006751_1145515292_a.jpg" username={this.props.username} score="240" />
				<QuestionContent onResponse={this.handleResponse} questionText={this.props.questionText} answerList={this.props.answerList} />
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
				<AnswerList answerList={this.props.answerList} onResponse={this.props.onResponse}/>
			</div>
		);
	}
});

var AnswerList = React.createClass({
	render() {
		var answerNodes = this.props.answerList.map(function (answer) {
			return (
				<Answer onResponse={this.props.onResponse} answerText={answer}/>
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
		this.setState({isAnswered: true});
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
				<QuestionBox url="https://hidden-castle-6417.herokuapp.com/wildfire/question/" pollInterval={2000}/>
			</div>
    	);
  	}
});

module.exports = App;