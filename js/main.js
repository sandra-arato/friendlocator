
function initialize() {

$.ajaxSetup({ cache: true });
$.getScript('//connect.facebook.net/en_UK/all.js', function(){
	FB.init({
		appId: 'YOUR_APP_ID',
	});
	$('#loginbutton,#feedbutton').removeAttr('disabled');
	FB.getLoginStatus(updateStatusCallback);
});
	
	
}

$(document).ready(initialize);
