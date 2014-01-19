
var syncInit = false;
var userLocationId;
var userFBLoc;

function initialize() {

	console.log("comment to check git origin master");

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '198937526977949', // App ID
			channelUrl : 'http://localhost/projects/friendlocator/channel.html',
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});

		syncInit = true;

		if (syncInit) {
			$("#fb-login-button").click(
				FB.login(function(response) {
					if (response.authResponse) {
						console.log('Welcome!  Fetching your information.... ');
						FB.api('/me', function(response) {
							console.log(response);
							console.log('Good to see you, ' + response.name + '.');
							userLocationId = response.location.id;

							FB.api("/"+userLocationId, function(response) {
								userFBLoc=response;
							});

						});
						
					}
					else {
						console.log('User cancelled login or did not fully authorize.');
					};
				})
			);
		}
	}
}


$(document).ready(initialize);
