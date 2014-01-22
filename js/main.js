
var syncInit = false;
var map;
var userFBLoc;
var friends = [];
var friendsOnMap = {};

function placeFriendsOnMap(friendsOnMap) {
	var fn = 0; // number of friends available on map
	for (var loc in friendsOnMap) {
		// setting up inner HTML of the infoWindow for each location
		var markerHtml = "<div class='friends-map' id='" + loc + "' style='overflow: visibile;'>" + friendsOnMap[loc].location.name + "<ul>" ;
		for (i in friendsOnMap[loc].users) {
			markerHtml = markerHtml + "<li> <img src='http://graph.facebook.com/" + friendsOnMap[loc].users[i].uid + "/picture'>" + friendsOnMap[loc].users[i].first_name + "</li>"
			fn++;
		};
		markerHtml = markerHtml + "</ul></div>"
		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(friendsOnMap[loc].location.latitude,friendsOnMap[loc].location.longitude),
			icon: "images/marker-32.ico",
			html: markerHtml
		});

		infowindow = new google.maps.InfoWindow({
			content: "placeholder",
			maxWidth: 420
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(this.html);
			infowindow.open(map, this);
		});
	};
$("#facebook-load").html(fn + " of your friends are on the map. Have fun exploring!");
	
}

function buildLocations() {

	// for each location that was searched for, friends at that location are added as an array of "users"
	for (var i in friends) {
		if (friends[i].current_location.id) {
			var c = friends[i].current_location.id;
			if (!friendsOnMap[c]) {
				friendsOnMap[c] = {};
				friendsOnMap[c].location = friends[i].current_location;
				friendsOnMap[c].users = [];
			}
			friendsOnMap[c].users.push(friends[i]);
		};

	}
	// the result is an object of locations with ids, geolocs and users at that place (etc)
	placeFriendsOnMap(friendsOnMap); // use the result to place markers on google maps where friends are
}

function mapLoad() {
	$("#container").append("<div id='map-canvas'></div>");
	var MY_MAPTYPE_ID = 'custom_style';

	var featureOpts = [
		{
			"featureType": "water",
			"stylers": [
				{"visibility": "on" },
				{ "color": "#5eb9ce"}
			]
		},
		{
			"featureType": "landscape",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#65e665" }
			]
		},
		{
			"featureType": "transit",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ff9f40" }
			]
		},
		{
			"featureType": "road",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#ff9f40" }
			]
		},
		{
			"featureType": "road",
			"elementType": "labels",
			"stylers": [
				{ "visibility": "off" }
			]
		},
		{
			"featureType": "poi",
			"stylers": [
				{ "visibility": "on" },
				{ "color": "#65e665" }
			]
		}
	];
	
	var styledMapOptions = {
		name: 'Custom Style'
	};

	var mapOptions = {
		zoom: 5,
		center: new google.maps.LatLng(userFBLoc.latitude,userFBLoc.longitude),
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
	$("#container").append("<div id='facebook-load'>Please click on the button above.</div>");
}


window.fbAsyncInit = function() {
	FB.init({
		appId      : '745988862080724', // App ID
		channelUrl : 'http://sandraszenti.github.io/channel-test/channel.html',
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});

	syncInit = true;

	if (syncInit) {
		addFacebookStatusInfo();
		$("#fb-login-button").click( function() {
			if ($("a#fb-login-button").html() == "login to facebook") {
				$("#fb-login-button").html("logout from facebook");

				FB.login(function(response) {
					if (response.authResponse) {
						$("#facebook-load").html("Welcome!  Fetching your information.... ").css("border-color", "#118511");
						// get user info and location to build map
						FB.api("/fql", {q: {"query1": "SELECT first_name, last_name, current_location FROM user WHERE uid = me()"}}, 
							function(response) {
								userFBLoc = response.data[0].fql_result_set[0].current_location;
								$("#facebook-load").html("Just a sec, " + response.data[0].fql_result_set[0].first_name + ", setting up your map now.");
								mapLoad(); //create a google map with the user's location as a center
						});
						// get friends info and their current geolocation
						FB.api("/fql", {q: {"query2": "SELECT uid, first_name, last_name, current_location FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND current_location"}}, 
							function(response) {
								friends = response.data[0].fql_result_set;
								buildLocations();
						});
					}
					else {
						$("#facebook-load").html("You cancelled login or did not fully authorize.");
					};
				}, {scope: 'user_location,friends_location'})
			}
			else {
				$("#fb-login-button").html("login to facebook");
				FB.logout(function(response) {
					$("#facebook-load").html("You're currently logged out.").css("border-color", "#FF4040");
					$("#map-canvas").css({"visibility": "hidden", "height": "20px"});
				});
			}}
		)
	}	
}

