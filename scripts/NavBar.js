var React = require('react');

var NavBar = React.createClass({
	render: function() {
		return (
			<div className="navBarBackground">
				<div className="navBarInner">
					<span>
						<a href="#" className="navHome">
							<span className="navHomeImage"><i className="fa fa-home fa-2x"></i></span>
							<span className="navHomeText"> Home</span>
						</a>
						<a href="#" className="navDiscover">
							<span className="navDiscoverImage"><i className="fa fa-slack fa-2x"></i></span>
							<span className="navDiscoverText"> Discover</span>
						</a>
						<img className="navLogo" src="../images/wildfire-logo.png"/>
						<a href="#" className="navProfileAvatarLink">
							<span>
								<img className="navProfileAvatarImage" src="https://igcdn-photos-f-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-19/10895024_315160272028181_1781198120_a.jpg"/>
							</span>
						</a>
					</span>
				</div>
			</div>
		);
	}
});

module.exports = NavBar;