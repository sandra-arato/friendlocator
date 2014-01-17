// function testAPI() {
// 	console.log('Welcome!  Fetching your information.... ');
// 	FB.api('/me', function(response) {
// 		console.log('Good to see you, ' + response.name + '.');
// 	});
// }


function initialize() {

	console.log("comment to check git origin master");

	// $.ajaxSetup({ cache: true });

	// $.getScript('//connect.facebook.net/en_UK/all.js', function(){
	// 	FB.init({
	// 		appId: '587389484676369',
	// 		status: true,
	// 		cookie: true,
	// 		xfbml: true
	// 	});
	// 	$('#loginbutton,#feedbutton').removeAttr('disabled');
	// 	FB.getLoginStatus(updateStatusCallback);

	// 	FB.Event.subscribe('auth.authResponseChange', function(response) {
	// 		if (response.status === 'connected') {
	// 			testAPI();
	// 		}
	// 		else if (response.status === 'not_authorized') {
	// 			FB.login();
	// 		}
	// 		else {
	// 			FB.login();
	// 		};
	// 	});
	// });

	
}


$(document).ready(initialize);
