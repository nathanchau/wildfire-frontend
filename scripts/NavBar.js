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
  	render: function() {
  		var SignUpNode;
  		if (this.state.isExpanded) {
  			SignUpNode = <button className="facebookSignUpButton">Sign up with Facebook <i className="fa fa-facebook-official fa-lg"></i></button>;
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