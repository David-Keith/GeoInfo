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



        geocodeLatLng(event.latLng, geocoder, map, infowindow); //show info window of location
        requestForecast(darkURL + event.latLng.toUrlValue()) //request and update current forecast
    })
});

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

    if (sessionStorage.getItem("isLoggedIn") == undefined || sessionStorage.getItem("isLoggedIn") === false) {
        $('#save').prop('disabled', true);
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

// Save location button event handler simply forwards to firebase event handler
// by adding a new location to the database
    $('#save').click(function() {
        // save current location's forecast in firebase (won't work if undefined)
        savedLocationsRef.push(forecast);
    });

// Firebase event handler for when a new location is added to the database
    savedLocationsRef.on("child_added", function(data) {
        // users can currently save up to 3 locations
        if ((numLocationsSaved >= locationCapacity)) return;
        numLocationsSaved++;

        // disable the save button when the capacity of saved locations is reached
        if (numLocationsSaved >= locationCapacity)
            $('#save').prop('disabled', true);

        // add the saved location to the page
        addSavedLocation(data.key, data.val());
    });

// Firebase event handler for when a saved location is modified
    savedLocationsRef.on("child_changed", function(data) {
        var location = data.val().latitude.toString() + ", " + data.val().longitude.toString();

        // add the DOM/html to the page
        $('div[data-index="' + data.key + '"]').html('<button onClick="goToLocation(this)">Go</button> Saved Location: '
            + location + '<button class="deleteButton" onclick="deleteItem(this.parentElement)">&#x2716;</button></div>');

        // ReactDOM.render(
        //     <SaveLocation elem={data} key={data.key} value={location}/>,
        //     document.getElementById('SavedLocationsParentDiv')
        // );
    });

// Firebase event handler for when a saved location is removed
    savedLocationsRef.on("child_removed", function(data) {
        // find the DOM object removed and remove it from firebase's database
        $('div[data-index="' + data.key + '"').remove();

        // update the locations counter and restore the save button
        numLocationsSaved--;
        if (numLocationsSaved < locationCapacity)
            $('#save').prop('disabled', false);
    });

})

/*--------
 * Other functions
 --------*/

// var SaveLocation = React.createClass({
//     render: function () {
//         return <div class="savedLocation" data-index={this.props.key}><button onClick={goToLocation(this.props.elem)}>Go</button> Saved Location:
//             {this.props.value} <button class="deleteButton" onclick={deleteItem(this.props.elem.parentElement)}>&#x2716;</button> </div>;
//     }
// });

// Updates the DOM by adding a saved location to the page
function addSavedLocation(key, value) {
    // add the location to the list with a goto and delete button
    // store the firebase key of the item in the html data-index for the object
    $(".savedLocations").append(
        '<div class="savedLocation" data-index=' + key + '><button onClick="goToLocation(this)">Go</button> Saved Location: '
        + value.savedAddress + '<button class="deleteButton" onclick="deleteItem(this.parentElement)">&#x2716;</button></div>');

    // ReactDOM.render(
    //     <SaveLocation k/>,
    //     document.getElementById('SavedLocationsParentDiv')
    // );
}

// When a user clicks the button to go to a saved location, update the map/forecast
function goToLocation(elem) {
    // Find the location stored in the database with the key that matches elem's parent index
    savedLocationsRef.child(elem.parentElement.dataset.index)
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

    var updatedLocation = elem.parentElement.getAttribute('data-index');
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

// Remove location button event handler simply forwards to firebase event handler
// by removing a location from the database
function deleteItem(divElem) {
    savedLocationsRef.child(divElem.dataset.index).remove();
}

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