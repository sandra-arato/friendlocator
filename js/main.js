
var syncInit = false;
var map;
var userLocationId;
var userFBLoc;
var friends = [];
var friendsLocation = "";
var friendsOnMap;

function placeFriendsOnMap(friendsOnMap) {
	var fn = 0; // number of friends
	for (var loc in friendsOnMap) {
		var markerHtml = "<div class='friends-map' id='" + loc + "' style='overflow: visibile;'>" + friendsOnMap[loc].name + "<ul>" ;
		for (i in friendsOnMap[loc].users) {
			markerHtml = markerHtml + "<li> <img src='http://graph.facebook.com/" + friendsOnMap[loc].users[i].id + "/picture'>" + friendsOnMap[loc].users[i].name + "</li>"
			fn++;
		};
		markerHtml = markerHtml + "</ul></div>"
		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(friendsOnMap[loc].location.latitude,friendsOnMap[loc].location.longitude),
			html: markerHtml
		});

		infowindow = new google.maps.InfoWindow({
			content: "placeholder"
		});

		google.maps.event.addListener(marker, 'click', function() {
			console.log("this is ", this);
			infowindow.setContent(this.html);
			infowindow.open(map, this);
		});
	};
$("#facebook-load").html(fn + " of your friends are on the map. Have fun exploring!");
	
}

function buildLocations() {

	// going through friends array and grabbing each location id and push it to a string
	for (var i in friends) {
		if (friends[i].location) {
			var c = friends[i].location.id;
			if (friendsLocation.search(c) == -1) {
				friendsLocation = friendsLocation + c + ","; // will use this string of loc ids to load geoloc from FB api
			};
		};
	};

	friendsLocation = friendsLocation.slice(0, friendsLocation.length-1);

	// fetching the geoloc info of friends from FB api
	FB.api("/?ids="+friendsLocation, function(response) {
		console.log("friends location loading...");
		$("#facebook-load").html("Now loading your friends' locations...");
		
		// for each location that was searched for, friends at that location are added as an array of "users"
		for (var i in friends) {
			if (friends[i].location) {
				if (response[friends[i].location.id]) {
					if (!response[friends[i].location.id].users) {
						response[friends[i].location.id].users = [];
					}
					response[friends[i].location.id].users.push(friends[i]);
				}
			};
		}

		friendsOnMap = response; // the result is an object of locations with ids, geolocs and users at that place (etc)
		placeFriendsOnMap(friendsOnMap); // use the result to place markers on google maps where friends are
		console.log("..................");
		console.log(friendsOnMap);
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
						// when user grants permission, user info and location is loaded"
						FB.api('/me', function(response) {
							console.log(response);
							$("#facebook-load").html("Good to see you, " + response.name + "!")
							var userId = response.id;
							if (response.location) {
								userLocationId = response.location.id;

								FB.api("/"+userLocationId, function(response) {
									userFBLoc=response;
									mapLoad(); //create a google map with the user's location as a center
								});
								// user's friends and their locations load from FB api
								FB.api("/"+userId+"/friends?fields=id,location,name", function(response) {
									$("#facebook-load").html("Searching for friends...");
									friends = response.data;
									$("#facebook-load").html(friends.length + " friends found on Facebook. Building your map now!");
									buildLocations(); // create location sets based on friends' data
								});
							};
							

						});
						
						
					}
					else {
						$("#facebook-load").html("You cancelled login or did not fully authorize.");
					};
				}, {scope: 'user_location,friends_location'})
			);
		}	
	}
}

function initialize() {
	FBinit();


}


$(document).ready(initialize);
