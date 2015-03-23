var React = require('react');

var NavBar = React.createClass({
	render: function() {
		console.log(this.props.currentUser);
		var SignUpNode;
		var TopRightNode;
		if (!this.props.currentUser.id) {
			SignUpNode = <SignUpBar />;
			TopRightNode = <button className="navLogInLink">Log In</button>
		} else {
			TopRightNode = <a href={"/profile/"+this.props.currentUser.id} className="navProfileAvatarLink"><span><img className="navProfileAvatarImage" src={this.props.currentUser.avatarUrl}/></span></a>;
		}
		return (
			<div>
				<div className="navBarBackground">
					<div className="navBarInner">
						<span>
							<a href="/" className="navHome">
								<span className="navHomeImage"><i className="fa fa-home fa-2x"></i></span>
								<span className="navHomeText"> Home</span>
							</a>
							<a href="/" className="navDiscover">
								<span className="navDiscoverImage"><i className="fa fa-slack fa-2x"></i></span>
								<span className="navDiscoverText"> Discover</span>
							</a>
							<img className="navLogo" src="../images/wildfire-logo.png"/>
							{TopRightNode}
						</span>
					</div>
				</div>
				<div className="navBarDummy"></div>
				{SignUpNode}
			</div>
		);
	}
});

var SignUpBar = React.createClass({
	getInitialState: function() {
	    return {isExpanded: false};
	},
	expandSignUp: function() {
		if (this.isMounted()) {
			this.setState({isExpanded: true});
		}
	},
	componentDidMount: function() {
	  window.fbAsyncInit = function() {
	    FB.init({
	      appId      : '878421032201814',
	      cookie     : true,  // enable cookies to allow the server to access
	                        // the session
	      xfbml      : true,  // parse social plugins on this page
	      version    : 'v2.2' // use version 2.1
	    });

	    // Now that we've initialized the JavaScript SDK, we call
	    // FB.getLoginStatus().  This function gets the state of the
	    // person visiting this page and can return one of three states to
	    // the callback you provide.  They can be:
	    //
	    // 1. Logged into your app ('connected')
	    // 2. Logged into Facebook, but not your app ('not_authorized')
	    // 3. Not logged into Facebook and can't tell if they are logged into
	    //    your app or not.
	    //
	    // These three cases are handled in the callback function.
	    FB.getLoginStatus(function(response) {
	      this.statusChangeCallback(response);
	    }.bind(this));
	  }.bind(this);

	  // Load the SDK asynchronously
	  (function(d, s, id) {
	    var js, fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) return;
	    js = d.createElement(s); js.id = id;
	    js.src = "//connect.facebook.net/en_US/sdk.js";
	    fjs.parentNode.insertBefore(js, fjs);
	  }(document, 'script', 'facebook-jssdk'));
	},

	// Here we run a very simple test of the Graph API after login is
	// successful.  See statusChangeCallback() for when this call is made.
	testAPI: function() {
	  	console.log('Welcome!  Fetching your information.... ');
	  	FB.api('/me', function(response) {
		  	console.log('Successful login for: ' + response.name);
		  	console.log(response.email);
		  	console.log(response.name.replace(/ /g,''));
		  	console.log(response.first_name);
		  	console.log(response.last_name);
		  	console.log(response.age_range);
		  	console.log(response.gender);
		  	console.log(response.locale);
	  	});
	  	FB.api('/me/picture?height=200&width=200', function(response) {
	  		console.log(response.data.url);
	  	});
	},

	// This is called with the results from from FB.getLoginStatus().
	statusChangeCallback: function(response) {
	  console.log('statusChangeCallback');
	  console.log(response);
	  // The response object is returned with a status field that lets the
	  // app know the current login status of the person.
	  // Full docs on the response object can be found in the documentation
	  // for FB.getLoginStatus().
	  if (response.status === 'connected') {
	    // Logged into your app and Facebook.
	    this.testAPI();
	  } else if (response.status === 'not_authorized') {
	    // The person is logged into Facebook, but not your app.
	    //document.getElementById('status').innerHTML = 'Please log ' +
	      'into this app.';
	  } else {
	    // The person is not logged into Facebook, so we're not sure if
	    // they are logged into this app or not.
	    //document.getElementById('status').innerHTML = 'Please log ' +
	    'into Facebook.';
	  }
	},

	// This function is called when someone finishes with the Login
	// Button.  See the onlogin handler attached to it in the sample
	// code below.
	checkLoginState: function() {
	  FB.getLoginStatus(function(response) {
	    this.statusChangeCallback(response);
	  }.bind(this));
	},

	handleClick: function() {
	  FB.login(this.checkLoginState(), {scope: 'public_profile,email'});
	},
  	render: function() {
  		var SignUpNode;
  		if (this.state.isExpanded) {
  			SignUpNode = <button className="facebookSignUpButton" onClick={this.handleClick}>Sign up with Facebook <i className="fa fa-facebook-official fa-lg"></i></button>;
  		} else {
  			SignUpNode = null;
  		}
    	return(
      		<div className="signUpBar">
        		<p>Not on Wildfire? Sign up, offer your opinion, and find out what others think. <span onClick={this.expandSignUp} className="fakeLink">Sign up now</span></p>
        		{SignUpNode}
      		</div>
        );
  	}
});

module.exports = NavBar;