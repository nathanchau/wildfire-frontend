'use strict';
require('./base.css');

var React = require('react');
var QuestionBox = require('./QuestionBox');
var NavBar = require('./NavBar');
//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;

// URLs
var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";
var GET_USER_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/users/";

var Profile = React.createClass({
	getInitialState: function() {
		return {user: {username:null, first_name:null, avatarUrl:null, id:null}, currentUser: {username:null, first_name:null, avatarUrl:null, id:null}};
	},
	handleLogIn: function(data) {
		console.log('(In HomePage) New User Authenticated ' + data.username);
		if (this.isMounted()) {
  			this.setState({currentUser: data});
  		}
  		// Set client-side cookie to token
  		// Currently set to expire a long time from now
  		// Todo: Implement Log Out
  		if (data.token) {
  			document.cookie = "token=" + data.token + "; expires=Mon, 1 Jan 2020 00:00:00 UTC";
  		}
	},
	eraseUser: function() {
    	console.log("Erasing");
    	// Erase cookie
  		document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  		if (this.isMounted()) {
  			this.setState({currentUser: {username:null, first_name:null, avatarUrl:null, id:null}});
  		}
	},
	loadUserFromServer: function() {
	    $.ajax({
	        url: GET_USER_URL + this.props.id + "/",
	        dataType: 'json',
	        success: function(data) {
	          if (this.isMounted()) {
	            this.setState({user: data.response});
	          }
	        }.bind(this),
	        error: function(xhr, status, err) {
	          console.error(url, status, err.toString());
	        }.bind(this)
	    });
	},
	componentDidMount: function() {
	    this.loadUserFromServer();
	},
	render: function() {
		return (
			<div className="body">
				<NavBar currentUser={this.state.currentUser} />
				<ProfileHeader user={this.state.user} currentUser={this.state.currentUser} eraseUser={this.eraseUser}/>
				<QuestionBox url={GET_QUESTION_URL} pollInterval={200000} onLogIn={this.handleLogIn} currentUser={this.state.currentUser} />
			</div>
		);
	}
});

var ProfileHeader = React.createClass({
	handleLogOut: function() {
		console.log("(In ProfileHeader) Getting out of here");
	    $.ajax({
	      	url: "http://hidden-castle-6417.herokuapp.com/wildfire/logout/",
	      	dataType: 'json',
	        type: 'POST',
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
	    		this.props.eraseUser();
	      	}.bind(this),
	      	error: function(xhr, status, err) {
	        	console.error(this.props.url, status, err.toString());
	      	}.bind(this)
	    });
	},
	render: function() {
		var buttonNode;
		if (this.props.user.id == this.props.currentUser.id) {
			buttonNode = <span><button className="profileSignOutButton" onClick={this.handleLogOut}><i className="fa fa-power-off"></i> Log Out</button><button className="profileSettingsButton"><i className="fa fa-cog"></i> Settings</button></span>;
		} else {
			buttonNode = <button className="profileFollowButton"><i className="fa fa-plus"></i> Follow {this.props.user.first_name}</button>;
		}
		return (
			<div className="profileBackground">
				<img className="profileAvatarImage" src={this.props.user.avatarUrl}/>
				<span className="profileName">{this.props.user.first_name}</span>
				<span className="profileUsername"> @{this.props.user.username}</span>
				<div className="profileQuestionsAsked">
					<p>29</p>
					<p className="profileSmallFont">Asked</p>
				</div>
				<div className="profileQuestionsAnswered">
					<p>29</p>
					<p className="profileSmallFont">Answered</p>
				</div>
				<div className="profileFollowers">
					<p>29</p>
					<p className="profileSmallFont">Followers</p>
				</div>
				{buttonNode}
			</div>
		);
	}
});

module.exports = Profile;