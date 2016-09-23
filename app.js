/**
 * controls the app page of the website
 */

$(document).ready(function () {
    if (sessionStorage.getItem("isLoggedIn") == undefined) {
        sessionStorage.setItem("isLoggedIn", "false");
    }

    // Run every 2 seconds to check if user is logged in
    var intervalID = setInterval(function () {
        if (sessionStorage.getItem("isLoggedIn") === "false") {
            goToLogin();
        }
    }, 2000);

    // Redirect user to login page
    function goToLogin() {
        $("#AppMain").hide();
        $("#UserNotLoggedIn").show();

        // Go to app after 3.5 seconds
        window.setTimeout(function () {
            window.location = "login.html"
        }, 3500);
    }
});

var locationsSaved = 0; //keeps track of how many locations a user has saved
var locationCapacity = 3; //users can save up this many locations total

// When a user clicks the button to save a new location, dynamically add the html for it to the list of saved locations
$(document).ready(function () {
	$('#save').click(function () {
		//users can currently save up to 3 locations
		if (locationsSaved >= locationCapacity)
			return;

		locationsSaved++;
		var location = Math.random(); //treat this as an identifier for a mock location

		//add the location to the list with a goto and delete button
		$(".savedLocations").append(
			'<div class="savedLocation" data-location=' + location + '><button onClick="goToLocation(this)">Go</button> Saved Location: '
			 + location + '<button class="deleteButton" onclick="deleteItem(this.parentElement)">&#x2716;</button></div>');
		//disable the save button when the capacity of saved locations is reached
		if (locationsSaved == locationCapacity)
			$('#save').prop('disabled', true);
	})
});

// When a user clicks the button to go to a saved location, update the map/forecast
function goToLocation(elem) {
	var updatedLocation = elem.parentElement.getAttribute('data-location');
	$('#current').html("Saved location: " + updatedLocation);

	//make a simple little animation to mock the actual update of the map and forecast
	$(".interactive").animate({
		opacity : 0.25,
		transform : "translate(4%, 4%)",
		transition : "0s"
	})
	.animate({
		opacity : 1,
		transform : "translate(-4%, -4%)",
		transition : "0s"
	});
}

// When a user clicks the location delete button, remove the location and ensure the save location button is not disabled
function deleteItem(divElem) {
	locationsSaved--;
	divElem.parentElement.removeChild(divElem);
	if (locationsSaved < locationCapacity)
		$('#save').prop('disabled', false);
}


/************************************************************
*
* Map and Forecast
*
*************************************************************/
var map; //map object for google maps api
var marker; //a single marker will be placed on the map whenever a user clicks the map with no current marker
var markerDisplayed = false; //used to determine if a map marker should be placed or removed
var darkSkyApiKey = '03d14d1e2d3de53ec23dd243075b9f42'; //the key needed to use the Dark Sky API for weather. should be private
var darkURL = "https://api.darksky.net/forecast/" + darkSkyApiKey + "/"; //forms the beginning of the ajax http get request url
var forecast; //object that will hold weather data for a specific location

// Initialize the google map centered on GMU
function initMap() {
	var gmu = {
		lat : 38.83,
		lng : -77.3076
	};
	map = new google.maps.Map(document.getElementById('map'), {
		center : gmu, //center map on GMU
		zoom : 12, //start map at this zoom
		draggableCursor : "auto" //use default mouse cursor instead of hand cursor when not dragging
	});
}

// The event listener for when the map is clicked
$(document).ready(function () {
	google.maps.event.addListener(map, 'click', function (event) {
		//if a marker is already displayed on the map, clear it and return
		if (markerDisplayed) {
			marker.setMap(null); //clear the marker
			markerDisplayed = false;
			return;
		}
		//otherwise add a marker and info window of the current location and request the forecast there
		addMarker(event.latLng, map);
		var geocoder = new google.maps.Geocoder;
		var infowindow = new google.maps.InfoWindow;
		geocodeLatLng(event.latLng, geocoder, map, infowindow);
		requestForecast(darkURL + event.latLng.toUrlValue())
	})
});

// Adds a marker to the map
function addMarker(location, map) {
	// Add the marker at the clicked location
	markerDisplayed = true;
	marker = new google.maps.Marker({
			position : location,
			map : map
		});
}

// Translate a lat/lng location object into a human-readable address and display it on the map
function geocodeLatLng(loc, geocoder, map, infowindow) {
	geocoder.geocode({
		'location' : loc
	}, function (results, status) {
		if (status === 'OK') {
			//display an infowindow on the map for the current location
			if (results[1]) {
				infowindow.setContent(results[1].formatted_address); //results is an array of location strings for current location
				infowindow.open(map, marker); //popup window on the map at the marker position
			} else {
				window.alert('No results found');
			}
		} else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}

// Perform the ajax http request to dark sky api. url should be 'https://api.darksky.net/forecast/[key]/[latitude],[longitude]'
function requestForecast(url) {
	$.ajax({
		url : url,
		// The name of the callback parameter
		jsonp : "callback",
		// Tell jQuery we're expecting JSONP
		dataType : "jsonp",
		// Work with the response by calling the given function
		success : displayForecast
	})
};

// When requestForecast() returns the dark sky forecast data, display it on the page
function displayForecast(data) {
	forecast = data;
	var curr = forecast.currently.icon; //a simple string representation of all weather descriptions
	
	// these are all the possible weather descriptions dark sky returns
	if (curr === "clear-day") console.log("clear day!");
	else if (curr === "clear-night") console.log("clear night!");
	else if (curr === "rain") console.log("rain! :(");
	else if (curr === "snow") console.log("snow!brr");
	else if (curr === "sleet") console.log("sleet!");
	else if (curr === "wind") console.log("windy!!");
	else if (curr === "fog") console.log("fog!!");
	else if (curr === "cloudy") console.log("clouds");
	else if (curr === "partly-cloudy-day") console.log("cloudy day");
	else if (curr === "partly-cloudy-night") console.log("cloudy night");
	else console.log("unknown weather: " + curr);
	
	// for now, can just show a simple forecast on the screen. later should do something more interesting with this data
	$('#forecastContainer').html("<h1>-Current Forecast-<br/>" + curr + "<br/>Temp: " + forecast.currently.temperature + "</h1>");
}