var React = require('react');

// Modal/Popover
//  Todo: separate this into a separate file?
//  http://stackoverflow.com/questions/26787198/reactjs-modal-using-javascript-and-css

var ReactLayeredComponentMixin = {
    componentWillUnmount: function() {
        this._unrenderLayer();
        document.body.removeChild(this._target);
    },
    componentDidUpdate: function() {
        this._renderLayer();
    },
    componentDidMount: function() {
        // Appending to the body is easier than managing the z-index of everything on the page.
        // It's also better for accessibility and makes stacking a snap (since components will stack
        // in mount order).
        this._target = document.createElement('div');
        document.body.appendChild(this._target);
        this._renderLayer();
    },
    _renderLayer: function() {
        // By calling this method in componentDidMount() and componentDidUpdate(), you're effectively
        // creating a "wormhole" that funnels React's hierarchical updates through to a DOM node on an
        // entirely different part of the page.
        React.renderComponent(this.renderLayer(), this._target);
    },
    _unrenderLayer: function() {
        React.unmountComponentAtNode(this._target);
    }
};

var Modal = React.createClass({
	getInitialState() {
		return {isValidated:false};
	},
	handleInput(e) {
		if (this.refs.password.getDOMNode().value != '') {
			this.setState({isValidated: true});
		} else {
			this.setState({isValidated: false});
		}
	},
	handleSubmit(e) {
		// Create the new user
		e.preventDefault();
		if (this.state.isValidated) {
			this.setState({isValidated: false});

			var username = this.refs.username.getDOMNode().value;
			var email = this.refs.email.getDOMNode().value;
			var password = this.refs.password.getDOMNode().value;
			var first_name = this.props.userResponse.first_name;
			var last_name = this.props.userResponse.last_name;
			var gender;
			if (this.props.userResponse.gender == "male") {
				gender = "M";
			} else { // this.props.userResponse.gender == "female"
				gender = "F";
			}
			var region = this.props.userResponse.locale;
			var avatarUrl = this.props.userPictureURL;
			var JSONObj = {"username": username, "email": email, "first_name": first_name, "last_name": last_name, "password": password, "gender": gender, "region": region, "avatarUrl": avatarUrl};
			var JSONStr = JSON.stringify(JSONObj);
			var reqData = "username=" + username + "&password=" + password;

			$.ajax({
	        	url: "https://hidden-castle-6417.herokuapp.com/wildfire/users/create/",
	        	dataType: 'json',
	        	type: 'POST',
	        	data: JSONStr,
	        	success: function(data) {
	          		// If successful, log the user in
	          		console.log("logging user in now...");
	          		this.handleLogin(reqData);
	        	}.bind(this),
	        	error: function(xhr, status, err) {
	        	  	console.error(status, err.toString());
	        	}.bind(this)
	      	});
		}
	},
	handleLogin(reqData) {
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
	},
    killClick: function(e) {
        // clicks on the content shouldn't close the modal
        e.stopPropagation();
    },
    handleBackdropClick: function() {
        // when you click the background, the user is requesting that the modal gets closed.
        // note that the modal has no say over whether it actually gets closed. the owner of the
        // modal owns the state. this just "asks" to be closed.
        this.props.onRequestClose();
    },
    componentDidMount:function() {
		document.modalForm.password.focus();
    },
    render: function() {
        return this.transferPropsTo(
            <div className="modalBackdrop" onClick={this.handleBackdropClick}>
                <div className="modalContent" onClick={this.killClick}>
                    {this.props.children}
                    <img className="modalAvatarImage" src={this.props.userPictureURL}></img>
                    <p className="modalTitle">{this.props.userResponse.name}</p>
                    <form className="modalForm" name="modalForm" onSubmit={this.handleSubmit} onInput={this.handleInput}>
	                    <div className="modalFormElement">
		                    <span className="modalHint">Username </span>
		                    <input className="modalInput" type="text" name="username" ref="username" placeholder="Choose a username" defaultValue={this.props.userResponse.name.replace(/ /g,'').toLowerCase()}></input>
	                    </div><div className="modalFormElement">
		                    <span className="modalHint">Email </span>
		                    <input className="modalInput" type="text" name="email" ref="email" placeholder="Enter your email" defaultValue={this.props.userResponse.email}></input>
	                    </div><div className="modalFormElement">
		                    <span className="modalHint">Password </span>
		                    <input className="modalInput" type="password" name="password" ref="password" placeholder="Enter a password"></input>
	                    </div>
	                    <button type="submit" className="modalSubmitButton">Create my account!</button>
                    </form>
                </div>
            </div>
        );
    }
});

// Navigation Bar

var NavBar = React.createClass({
	render: function() {
		console.log(this.props.currentUser);
		var SignUpNode;
		var TopRightNode;
		if (!this.props.currentUser.id) {
			SignUpNode = <SignUpBar onLogIn={this.props.onLogIn}/>;
			//TopRightNode = <button className="navLogInLink">Log In</button>;
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
							<a href="/search/nathan" className="navDiscover">
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
    mixins: [ReactLayeredComponentMixin],
    toggleModal: function() {
    	console.log("Toggling Modal");
        this.setState({shown: !this.state.shown});
    },
    renderLayer: function() {
        if (!this.state.shown) {
            return <span />;
        }
        return (
            <Modal onRequestClose={this.toggleModal} userResponse={this.state.userResponse} userPictureURL={this.state.userPictureURL} onLogIn={this.props.onLogIn}/>
        );
    },
	getInitialState: function() {
	    return {isExpanded: false, shown: false, modalShown: false, userResponse:{email:null,name:null,first_name:null,last_name:null,age_range:null,gender:null,locale:null}, userPictureURL:null};
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
	      //this.statusChangeCallback(response);
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
		  	console.log(response.name.replace(/ /g,'').toLowerCase());
		  	console.log(response.first_name);
		  	console.log(response.last_name);
		  	console.log(response.age_range);
		  	console.log(response.gender);
		  	console.log(response.locale);
		  	if (this.isMounted()) {
		  		this.setState({userResponse:response});
		  	}
		  	FB.api('/me/picture?height=200&width=200', function(response) {
		  		console.log(response.data.url);
			  	if (this.isMounted()) {
			  		this.setState({userPictureURL:response.data.url});
			  	}
				this.toggleModal();
				FB.logout(function(response) {
					// User should now be logged out
				});
		  	}.bind(this));
	  	}.bind(this));
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
	    //  'into this app.';
	  } else {
	    // The person is not logged into Facebook, so we're not sure if
	    // they are logged into this app or not.
	    //document.getElementById('status').innerHTML = 'Please log ' +
	    //'into Facebook.';
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
	  //FB.login(this.checkLoginState(), {scope: 'public_profile,email'});
	  FB.login(function(response) {
	  	this.checkLoginState();
	  }.bind(this), {scope: 'public_profile,email'});
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