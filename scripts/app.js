'use strict';

var React = require('react');

var data = [
{
	"id": 1,
	"text": "What isn't love?",
	"question_type": "MultipleChoice",
	"answer_list": [
		{
			"answer_text": "Baby Don't Hurt Me"
		},
		{
			"answer_text": "Don't Hurt Me"
		},
		{
			"answer_text": "No More"
		}
	],
	"date": "2015-02-07T02:37:09.176988Z",
	"asker": {
		"id": 2,
		"username": "Alex",
		"age": 19,
		"gender": "M",
		"region": "",
		"join_date": "2015-02-03T06:38:24.792097Z"
	}
},
{
	"id": 1,
	"text": "What is love?",
	"question_type": "MultipleChoice",
	"answer_list": [
		{
			"answer_text": "Baby Don't Hurt Me"
		},
		{
			"answer_text": "Don't Hurt Me"
		},
		{
			"answer_text": "No More"
		}
	],
	"date": "2015-02-07T02:37:09.176988Z",
	"asker": {
		"id": 2,
		"username": "Alex",
		"age": 19,
		"gender": "M",
		"region": "",
		"join_date": "2015-02-03T06:38:24.792097Z"
	}
}
];

var QuestionBox = React.createClass({
	render() {
		return (
			<div className="questionBox">
				<QuestionList data={this.props.data}/>
			</div>
		);
	}
});

var QuestionList = React.createClass({
	render() {
		var questionNodes = this.props.data.map(function (question) {
			return (
				<Question questionText={question.text} username={question.asker.username} answerList={question.answer_list} isAnswered={false} />
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
				<Answer onResponse={this.props.onResponse} answerText={answer.answer_text}/>
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
				<QuestionBox data={data}/>
			</div>
    	);
  	}
});

module.exports = App;