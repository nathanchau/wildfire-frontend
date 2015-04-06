var React = require('react');

var QuestionCreatorContent = React.createClass({

	handleSubmit(e) {
		e.preventDefault();
		if (this.state.isValidated) {
			this.props.onSubmit();
			this.setState({isValidated: false});

			var options = [this.refs.answer1.getDOMNode().value];
			if (this.refs.answer2 && this.refs.answer2.getDOMNode().value != '') {
				options.push(this.refs.answer2.getDOMNode().value);
			} 
			if (this.refs.answer3 && this.refs.answer3.getDOMNode().value != '') {
				options.push(this.refs.answer3.getDOMNode().value);
			} 
			if (this.refs.answer4 && this.refs.answer4.getDOMNode().value != '') {
				options.push(this.refs.answer4.getDOMNode().value);
			} 
			if (this.refs.answer5 && this.refs.answer5.getDOMNode().value != '') {
				options.push(this.refs.answer5.getDOMNode().value);
			}

			var categories = this.refs.category.getDOMNode().value.split(" ");

			var JSONObj = { "asker": this.props.currentUser.id, "questionType": this.state.contentType, "text": this.refs.question.getDOMNode().value, "options": options, "categories": categories};
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
		return {isValidated:false, contentType: "MC"};
	},
	handleInput(e) {
		if (this.refs.question.getDOMNode().value != '' && this.refs.answer1.getDOMNode().value != '') {
			this.setState({isValidated: true});
		} else {
			this.setState({isValidated: false});
		}
	},
	handleChange(e) {
		var radButtons=document.questionCreatorForm.questionType;
		for(i=0; i<radButtons.length; i++) {
			if(radButtons[i].checked) {
				if(radButtons[i].value=="MC") {
					this.setState({contentType: "MC"});
				} else if(radButtons[i].value=="RG") {
					this.setState({contentType: "RG"});
					console.log("state changed to RG");
				}
			}
		}
	},
	render() {
		var classString = 'questionCreatorContent';
		if (this.props.isCondensed) {
			classString += ' condensed';
		} else if (this.state.isValidated) {
			classString += ' validated';
		}
		var content;
		if(this.state.contentType=="MC"){
			content=<div><div className="questionCreatorAnswerList" id="questionCreatorAnswerList">
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
				</div>;

				} else if(this.state.contentType == "RG") {
					content= <div><div className="questionCreatorAnswerList" id="questionCreatorAnswerList">
						<ol type="a">
							<div className="questionCreatorAnswerListElement">
								<li><textarea className="questionCreatorAnswer" name="answer" placeholder="Enter lower bound" rows="1" onChange={this.handleChange} ref="answer1"></textarea></li>
							</div>
							<div className="questionCreatorAnswerListElement">
								<li><textarea className="questionCreatorAnswer" name="answer" placeholder="Enter upper bound" rows="1" onChange={this.handleChange} ref="answer2"></textarea></li>
							</div>
							</ol>
						</div>
						<button className="questionCreatorButton" type="submit" value="Ask this question">Ask this question <i className="fa fa-paper-plane-o"></i></button>
					</div>;
		}
		return (
			<div className={classString}>
				<form className="questionCreatorForm" name="questionCreatorForm" onSubmit={this.handleSubmit} onInput={this.handleInput}>
				<textarea className="expanding questionCreatorText" name="questionText" placeholder="Ask a question..." rows="1" ref="question"></textarea>
				<textarea className="expanding questionCreatorText categoryCreatorText" name="categoryText" placeholder="Add a category..." rows="1" ref="category"></textarea>
				<input type="radio" name="questionType" value="MC" onChange={this.handleChange}>Multiple Choice</input>
				<input className="questionCreatorAnswer" type="radio" name="questionType" value="RG" onChange={this.handleChange}>Slider</input>
				{content}
				</form>
			</div>
		);
	}
});

module.exports = QuestionCreatorContent;