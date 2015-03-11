'use strict';
require('./base.css');
require('./expanding');
require('jquery');

var React = require('react');

var QuestionBox = require('./QuestionBox');
var NavBar = require('./NavBar');
var Profile = require('./Profile');

// URLs
var GET_QUESTION_URL = "https://hidden-castle-6417.herokuapp.com/wildfire/question/";

//Router 
RouterMixin = require('react-mini-router').RouterMixin;
var navigate = require('react-mini-router').navigate;
var DetailedStats = require('./DetailedStats');

var piedata = [ {name: "one", value: 10375},
      {name: "two", value:  7615},
      {name: "three", value:  832},
      {name: "four", value:  516},
      {name: "five", value:  491} ];

var HomePage = React.createClass({
	getInitialState: function() {
		return {currentUser: {username:null, first_name:null, avatarUrl:null, id:null}};
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
	render: function() {
		return (
			<div className="body">
				<NavBar currentUser={this.state.currentUser} />
				<QuestionBox url={GET_QUESTION_URL} pollInterval={200000} onLogIn={this.handleLogIn} currentUser={this.state.currentUser} />
			</div>
    	);
  	}
});

var App = React.createClass({

    mixins: [RouterMixin],

    routes: {
        '/': 'home',
        '/message/:text': 'message',
        '/detailedStats/:id' : 'detailedStats', 
        '/profile/:id' : 'profile',
    },

    render: function() {
        return this.renderCurrentRoute();
    },

    home: function() {
        return <HomePage/>;
    },

    message: function(text) {
        return <div>{text}</div>;
    },

    detailedStats: function(id) {
        return <DetailedStats id={id} data={piedata}/>;
    },

    profile: function(id) {
    	return <Profile id={id}/>;
    },

    notFound: function(path) {
        return <div class="not-found">Page Not Found: {path}</div>;
    }

});

module.exports = App;