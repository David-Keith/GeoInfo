/**
 * controls the app page of the website
 */

"use strict";
 
// $(document).ready(function () {
    // if (sessionStorage.getItem("isLoggedIn") == undefined) {
        // sessionStorage.setItem("isLoggedIn", "false");
    // }

    // // Run every 2 seconds to check if user is logged in
    // var intervalID = setInterval(function () {
        // if (sessionStorage.getItem("isLoggedIn") === "false") {
            // goToLogin();
        // }
    // }, 2000);

    // // Redirect user to login page
    // function goToLogin() {
        // $("#AppMain").hide();
        // $("#UserNotLoggedIn").show();

        // // Go to app after 3.5 seconds
        // window.setTimeout(function () {
            // window.location = "login.html"
        // }, 3500);
    // }
// });

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
var savedResults; //save the results that are generated for a reverse geocoded address when the map is marked

// Initialize the google map centered on GMU
function initMap() {
	var gmu = {
		lat : 38.83,
		lng : -77.3076
	};
	map = new google.maps.Map(document.getElementById('map'), {
		center : gmu, //center map on GMU
		zoom : 4, //start map at this zoom
		draggableCursor : "auto" //use default mouse cursor instead of hand cursor when not dragging
	});
}
initMap();

// The event listener for when the map is clicked
// $(document).ready(function () {
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
		
		
		
		geocodeLatLng(event.latLng, geocoder, map, infowindow); //show info window of location
		requestForecast(darkURL + event.latLng.toUrlValue()) //request and update current forecast
	})
// });

// Adds a marker to the map
function addMarker(location, map) {
	if (marker != undefined) marker.setMap(null); //clear any current marker
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
				savedResults = results;
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
	forecast.savedAddress = savedResults[1].formatted_address; //keep track of human readable address for this forecast
	var curr = forecast.currently.icon; //a simple string representation of all weather descriptions

	// Update the DOM forecast display using React class Fcast, defined below
	ReactDOM.render(<Fcast />, document.getElementById('forecastContainer'));

	// these are all the possible weather descriptions dark sky returns
	// want to display an icon for these conditions eventually
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

// 	// for now, can just show a simple forecast on the screen. later should do something more interesting with this data
// 	$('#forecastContainer').html("<h1>-Current Forecast-<br/>" + curr + "<br/>Temp: " + forecast.currently.temperature + "</h1>");
}

// React class to update UI on forecast changes. To use appropriately, setState() should be used, NOT this.state = ...
// in render(). To do this, need to somehow register setState() to be called after the forecast API callback returns
class Fcast extends React.Component {
	constructor() {
		super();
		this.state = { forecast: forecast };
	}
	render() {
		this.state.forecast = forecast;
		if (this.state.forecast === undefined) return null;
		return (<div><h1>-Current Forecast-<br/> {this.state.forecast.currently.icon} <br/>Temp: {this.state.forecast.currently.temperature }</h1></div>);
	}
}


/************************************************************
*
* Saving/restoring a location
*
*************************************************************/
var numLocationsSaved = 0; //keeps track of how many locations the user has saved
var locationCapacity = 3; //the user can save up to this many locations
var savedLocationsRef; //reference to the database of saved locations for the current user
  
// Need to wait for the page to be loaded, then run rest of the code
$(document).ready(function () {

// If not user is logged in, don't continue. Don't need to offer the ability to save/go to saved locations
if (sessionStorage.getItem("isLoggedIn") == undefined || sessionStorage.getItem("isLoggedIn") === false) {
	return;
}

// Initialize Firebase
var config = {
	apiKey: "AIzaSyD2UUPgwcNq70p5B7GfpaQqiIZOmJNPFjs",
    authDomain: "my-project-1474597391583.firebaseapp.com",
    databaseURL: "https://my-project-1474597391583.firebaseio.com",
    storageBucket: "my-project-1474597391583.appspot.com",
    messagingSenderId: "32110869379"
  };
firebase.initializeApp(config);

// Reference to currently logged in user's saved locations in firebase
savedLocationsRef = firebase.database().ref('users/' + sessionStorage.getItem("username") + '/' + 'savedLocations');

// Firebase event handler for when a new location is added to the database
savedLocationsRef.on("child_added", function(data) {
	// users can currently save up to 3 locations
	if ((numLocationsSaved >= locationCapacity)) return;
	numLocationsSaved++;
	
	// disable the save button when the capacity of saved locations is reached
	if (numLocationsSaved >= locationCapacity)
		$('#saveButton').prop('disabled', true);
});

// Firebase event handler for when a saved location is removed
savedLocationsRef.on("child_removed", function(data) {
	// update the locations counter and restore the save button
	numLocationsSaved--;
	if (numLocationsSaved < locationCapacity)
		$('#saveButton').prop('disabled', false);
});

// })

// React component to represent a user's list of saved locations
var SavedLocationsList = React.createClass({
	render: function () {
		var _this = this; //In the subcomponent, "this" will refer to window, so need to save "this" here

		// For each saved location there will be a button to go to it, address name, and a button to delete it
		var createItem = function (item, key) {
			return (<div key={key}><button onClick={_this.props.goToLoc.bind(null, item)}>Go</button>
			{item.savedAddress}
			<button onClick={_this.props.removeItem.bind(null, item['.key'])}>&#x2716;</button>
			</div>);
		};
		return <ul>{this.props.items.map(createItem)}</ul>;
	}
});

// React component that contains SavedLocationsList and a button to save a new location
var SavedLocationsApp = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function () {
		return {items: []};
	},

	// Binds React to the specified firebase database which loads the database and tracks changes
	componentWillMount: function () {
		this.fireRef = firebase.database().ref('users/' + sessionStorage.getItem("username") + '/' + 'savedLocations');

		this.bindAsArray(this.fireRef, "items");
	},
	// onChange: function (fireKey, event) {
	// 	this.fireRef.child(fireKey).set({"text": event.target.value});
	// },

	// forwards removing to the firebase event listener above
	removeItem: function (key) {
		this.fireRef.child(key).remove();
	},

	// forwards adding to the firebase event listener above
	handleAdd: function (e) {
		this.fireRef.push(forecast);
	},
	// when a user clicks to go to a location, forward that call to goToLocation
	goToLoc: function(item) {
		goToLocation(item['.key']);
	},
	render: function () {
		return (
			<div>
			<u>Saved Locations</u>
			<SavedLocationsList items={this.state.items} removeItem={this.removeItem} goToLoc={this.goToLoc} />
		<button id={'saveButton'} onClick={this.handleAdd}>Save</button>
		</div>
		);
	}
});

ReactDOM.render(<SavedLocationsApp />, document.getElementById('SavedLocationsParentDiv'));

})

/*--------
* Other functions
--------*/

// When a user clicks the button to go to a saved location, update the map/forecast
// based on the key for the location saved in the database
function goToLocation(key) {
	// Find the location stored in the database with the key that matches elem's parent index
	savedLocationsRef.child(key)
	.once("value")
	.then(function(snapshot) {
		// get the data for corresponding location
		var currentLat = snapshot.val().latitude;
		var currentLng = snapshot.val().longitude;
		var currentLatLng = {lat: currentLat, lng: currentLng};

		// update the current forecast shown
		requestForecast(darkURL + currentLat + "," + currentLng);

		// update the map by going to the location being requested
		var geocoder = new google.maps.Geocoder;
		var infowindow = new google.maps.InfoWindow;
		addMarker(currentLatLng, map); //add map marker
		geocodeLatLng(currentLatLng, geocoder, map, infowindow); //show info window of location
	});

	$('#current').html("Saved location: " + key);

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

// UNUSED: for know-how purposes only
// Return the total number of locations saved in the database for the user. (no simpler way to do this)
function numLocationsInDatabase() {
	var num;
	savedLocationsRef.once("value", function(snapshot) {
		num = snapshot.numChildren();
		console.log("saved positions: " + num);
	});
	
	// Getting num of children by using a promise
	// savedLocationsRef.once("value")
	// .then(function(snapshot) {
		// return snapshot.numChildren();
	// })
	// .catch(function(error) {
		// console.log("error getting snapshot!");
	// })
	
	return num;
}