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
				<QuestionCreatorContainer />
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
		var classString = 'questionHeader';
		if (this.props.isCondensed) {
			classString += ' condensed';
		}
		return (
			<div className={classString}>
				<img src={this.props.avatarURL} className="questionAvatar" />
				<div className="questionUsername">{this.props.username}</div>
				<div className="questionCategory">asked about Philosophy</div>
				<div className="questionScore">{this.props.score}</div>
				<div className="questionScoreAccessory">answered</div>
				<div className="questionAsk">Ask a question...</div>
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
					<Answer onResponse={this.props.onResponse} answerText={answer} index={i}/>
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
	handleResponse(index) {
		this.props.onResponse();
		if (this.isMounted()) {
			this.setState({isAnswered: true});
		}
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
		return (
			<div className="questionCreatorContainer">
				<QuestionCreator />
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
	},
	handleSubmit(e) {
		this.setState({isCondensed: true});
	},
	render() {
		var creatorNode;
		if (this.state.isCondensed) {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarURL="https://igcdn-photos-f-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/10895024_315160272028181_1781198120_a.jpg" username="Nathan" score="0" isCondensed={true}/><QuestionCreatorContent isCondensed={true} onSubmit={this.handleSubmit}/></div>;
		} else {
			creatorNode = <div className="questionCreator"><QuestionHeader avatarURL="https://igcdn-photos-f-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/10895024_315160272028181_1781198120_a.jpg" username="Nathan" score="0" isCondensed={false}/><QuestionCreatorContent isCondensed={false} onSubmit={this.handleSubmit}/></div>;
		}
		return (
			<div onClick={this.handleClick}>{creatorNode}</div>
		);
	}
});

var QuestionCreatorContent = React.createClass({
	handleSubmit(e) {
		e.preventDefault();
		this.props.onSubmit();
		this.setState({isValidated: false});

		// TODO: POST to Server
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

		var JSONObj = { "asker": 5, "questionType": 'MC', "text": this.refs.question.getDOMNode().value, "options": options};
		var JSONStr = JSON.stringify(JSONObj);

		$.ajax({
        	url: "https://hidden-castle-6417.herokuapp.com/wildfire/question/create/",
        	dataType: 'json',
        	type: 'POST',
        	data: JSONStr,
        	success: function(data) {
          		//this.setState({data: data});
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
				<form className="questionCreatorForm" onSubmit={this.handleSubmit} onInput={this.handleInput}>
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

var App = React.createClass({
	render() {
		return (
			<div className="body">
				<div className="Title"><h1><i className="fa fa-tree"></i> Wildfire</h1></div>
				<QuestionBox url="https://hidden-castle-6417.herokuapp.com/wildfire/question/" answerUrl = "https://hidden-castle-6417.herokuapp.com/wildfire/answers/create/" pollInterval={2000000}/>
			</div>
    	);
  	}
});

module.exports = App;