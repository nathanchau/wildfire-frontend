var React = require('react');

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

			var categories = this.refs.category.getDOMNode().value.split(" ");

			var JSONObj = { "asker": this.props.currentUser.id, "questionType": 'MC', "text": this.refs.question.getDOMNode().value, "options": options, "categories": categories};
			var JSONStr = JSON.stringify(JSONObj);

			$.ajax({
	        	url: "https://hidden-castle-6417.herokuapp.com/wildfire/question/create/",
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
		      		if (tokenValue) {
		      			xhr.setRequestHeader("Authorization", "Token " + tokenValue);
		      		}
		      	},
	        	success: function(data) {
	          		//this.setState({data: data});
	          		console.log(data.response);
	          		this.props.onQuestionCreation(data.response);
	        	}.bind(this),
	        	error: function(xhr, status, err) {
	        	  	console.error(status, err.toString());
	        	}.bind(this)
	      	});

	    	this.refs.question.getDOMNode().value = '';
	    	this.refs.category.getDOMNode().value = '';
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
				<textarea className="expanding questionCreatorText categoryCreatorText" name="categoryText" placeholder="Add a category..." rows="1" ref="category"></textarea>

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

module.exports = QuestionCreatorContent;