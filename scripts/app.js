'use strict';
require('./base.css');
require('./expanding');
require('jquery');

var React = require('react');

var QuestionBox = require('./QuestionBox');
var NavBar = require('./NavBar');
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
	render: function() {
		return (
			<div className="body">
				<NavBar />
				<QuestionBox url={GET_QUESTION_URL} pollInterval={200000}/>
			</div>
    	);
  	}
});

var App = React.createClass({

    mixins: [RouterMixin],

    routes: {
        '/': 'home',
        '/message/:text': 'message',
        '/detailedStats/:id' : 'detailedStats'
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

    notFound: function(path) {
        return <div class="not-found">Page Not Found: {path}</div>;
    }

});

module.exports = App;