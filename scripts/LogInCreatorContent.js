var React = require('react');

var LogInCreatorContent = React.createClass({
	handleSubmit(e) {
		e.preventDefault();
		if (this.state.isValidated) {
			this.props.onSubmit();
			this.setState({isValidated: false});

			var username = this.refs.username.getDOMNode().value;
			var password = this.refs.password.getDOMNode().value;
			var reqData = "username=" + username + "&password=" + password;

			$.ajax({
	        	url: "https://hidden-castle-6417.herokuapp.com/wildfire/login/",
	        	dataType: 'HTML',
	        	type: 'POST',
	        	data: reqData,
	        	success: function(data) {
	          		//this.setState({data: data});
	          		this.props.onLogIn(JSON.parse(data));
	        	}.bind(this),
	        	error: function(xhr, status, err) {
	        	  	console.error(status, err.toString());
	        	}.bind(this)
	      	});

	    	this.refs.username.getDOMNode().value = '';
	    	this.refs.password.getDOMNode().value = '';
		}
	},
	getInitialState() {
		return {isValidated:false};
	},
	handleInput(e) {
		if (this.refs.username.getDOMNode().value != '' && this.refs.password.getDOMNode().value != '') {
			this.setState({isValidated: true});
		} else {
			this.setState({isValidated: false});
		}
	},
	render() {
		var classString = 'logInCreatorContent';
		if (this.props.isCondensed) {
			classString += ' condensed';
		} else if (this.state.isValidated) {
			classString += ' validated';
		}
		return (
			<div className={classString}>
				<form className="logInCreatorForm" name="logInForm" onSubmit={this.handleSubmit} onInput={this.handleInput}>
				<textarea className="expanding logInCreatorText" name="logInUsername" placeholder="Username" rows="1" ref="username"></textarea>
				<textarea className="expanding logInCreatorText" name="logInPassword" placeholder="Password" rows="1" ref="password"></textarea>

				<button className="logInCreatorButton" type="submit" value="Log In">Log In <i className="fa fa-tree"></i></button>

				</form>
			</div>
		);
	}
});

module.exports = LogInCreatorContent;