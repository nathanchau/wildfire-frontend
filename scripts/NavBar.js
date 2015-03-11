var React = require('react');

var NavBar = React.createClass({
	render: function() {
		console.log(this.props.currentUser);
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
							<a href={"/profile/"+this.props.currentUser.id} className="navProfileAvatarLink">
								<span>
									<img className="navProfileAvatarImage" src={this.props.currentUser.avatarUrl}/>
								</span>
							</a>
						</span>
					</div>
				</div>
				<div className="navBarDummy"></div>
			</div>
		);
	}
});

module.exports = NavBar;