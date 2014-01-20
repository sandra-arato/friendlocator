
var syncInit = false;
var userLocationId;
var userFBLoc;
var friends = [];
var friendsLocation = "";
var friendsOnMap = {
	location: "",
	users: []
};

function buildLocations() {
	for (var i in friends) {
		if (friends[i].location) {
			var c = friends[i].location.id;
			if (friendsLocation.search(c) == -1) {
				friendsLocation = friendsLocation + c + ",";
			};
		};
	};

	friendsLocation = friendsLocation.slice(0, friendsLocation.length-1);

	FB.api("/?ids="+friendsLocation, function(response) {
		console.log("friends location loading...");
		$("#facebook-load").html("Now loading your friends' locations...");
		console.log(response);
	});
}

function mapLoad() {
	$("#container").append("<div id='map-canvas'></div>");
	var MY_MAPTYPE_ID = 'custom_style';

	var featureOpts = [
		{
			"featureType": "water",
			"stylers": [
				{"visibility": "on" },
				{ "color": "#003466" }
			]
		},
		{
			"featureType": "landscape",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ffffff" }
			]
		},
		{
			"featureType": "transit",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ffffff" }
			]
		},
		{
			"featureType": "road",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ffffff" }
			]
		},
		{
			"featureType": "administrative.province",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ffffff" }
			]
		},
		{
			"featureType": "administrative.land_parcel",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ffffff" }
			]
		},
		{
			"featureType": "poi",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ffffff" }
			]
		}
	];
	
	var styledMapOptions = {
		name: 'Custom Style'
	};

	var mapOptions = {
		zoom: 5,
		center: new google.maps.LatLng(userFBLoc.location.latitude,userFBLoc.location.longitude),
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		disableDoubleClickZoom: false,
		draggable: true,
		scrollwheel: true,
		mapTypeControlOptions: {
			mapTypeIds: [
				google.maps.MapTypeId.ROADMAP,
				MY_MAPTYPE_ID
			]
		},
		mapTypeId: MY_MAPTYPE_ID
	};

	var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
}

function addFacebookStatusInfo () {
	$("#container").append("<div id='facebook-load'>Thanks for trusting me with your data</div>");
}

function FBinit() {
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
			addFacebookStatusInfo();
			$("#fb-login-button").click(
				FB.login(function(response) {
					if (response.authResponse) {
						$("#facebook-load").html("Welcome!  Fetching your information.... ");
						
						FB.api('/me', function(response) {
							$("#facebook-load").html("Good to see you, " + response.name + "!")
							var userId = response.id;
							userLocationId = response.location.id;

							FB.api("/"+userLocationId, function(response) {
								userFBLoc=response;
								mapLoad();

							});

							FB.api("/"+userId+"/friends?fields=id,location,name", function(response) {
								$("#facebook-load").html("Searching for friends...");
								friends = response.data;
								$("#facebook-load").html(friends.length + " friends found on Facebook. Building your map now!");
								buildLocations();
							});

						});
						
						
					}
					else {
						$("#facebook-load").html("You cancelled login or did not fully authorize.");
					};
				}, {scope: 'friends_location'})
			);
		}	
	}
}

function initialize() {
	FBinit();
}


$(document).ready(initialize);
