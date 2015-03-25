var React = require('react');

var LogInCreatorContent = require('./LogInCreatorContent');

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

// This shouldn't be here - super hacky
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

module.exports = LogInContainer;