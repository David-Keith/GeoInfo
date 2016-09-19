/**
 * controls the app page of the website
 */

$(document).ready(function () {
    if (sessionStorage.getItem("isLoggedIn") == undefined) {
        sessionStorage.setItem("isLoggedIn", "false");
    }

    // Run every 2 seconds to check if user is logged in
    var intervalID = setInterval(function () {
        console.log(sessionStorage.getItem("isLoggedIn"));
        if (sessionStorage.getItem("isLoggedIn") === "false") {
            goToLogin();
        }
    }, 2000);

    // Redirect user to login page
    function goToLogin() {
        $("#AppMain").hide();
        $("#UserNotLoggedIn").show();

        // Go to app after 5 seconds
        window.setTimeout(function () {
            window.location = "login.html"
        }, 5000);
    }
});

//when a user clicks the button to save a new location, dynamically add the html for it to the list of saved locations
    $("#save").click(function () {
        //users can currently save up to 3 locations
        if (locationsSaved >= locationCapacity) return;

var locationsSaved = 0; //keeps track of how many locations a user has saved
var locationCapacity = 3; //users can save up this many locations total

// When a user clicks the button to save a new location, dynamically add the html for it to the list of saved locations
$(document).ready(function() {
$('#save').click(function() {
	//users can currently save up to 3 locations
  if (locationsSaved >= locationCapacity) return;
  
  locationsSaved++;
  var location = Math.random(); //treat this as an identifier for a mock location
  
  //add the location to the list with a goto and delete button
  $(".savedLocations").append(
    '<div class="savedLocation" data-location=' + location + '><button onClick="goToLocation(this)">Go</button> Saved Location: '
    + location + '<button class="deleteButton" onclick="deleteItem(this.parentElement)">&#x2716;</button></div>'
  );
  //disable the save button when the capacity of saved locations is reached
  if (locationsSaved == locationCapacity) $('#save').prop('disabled', true);
})
});

// When a user clicks the button to go to a saved location, update the map/forecast
function goToLocation(elem) {
  var updatedLocation = elem.parentElement.getAttribute('data-location');
  $('#current').html("Saved location: " + updatedLocation);
  
  //make a simple little animation to mock the actual update of the map and forecast
  $(".interactive").animate({
    opacity: 0.25,
    transform: "translate(4%, 4%)",
    transition: "0s"
  })
  .animate({
  opacity: 1,
  transform: "translate(-4%, -4%)",
  transition: "0s"
  });
}

// When a user clicks the location delete button, remove the location and ensure the save location button is not disabled
function deleteItem(divElem)
{
		locationsSaved--;
    divElem.parentElement.removeChild(divElem);
    if (locationsSaved < locationCapacity) $('#save').prop('disabled', false);
}

/*
* Code for the main home page
*/

// When a user clicks the about button, info about the site is shown if not already. This action is added to the history stack
$(document).ready(function() {
$('#about').click(function() {
	// if info about the site is already displayed, do nothing
	if (history.state != null && history.state.about === true) return;
	
	// otherwise show the hidden view and add the default hidden view to the history stack
	var s = {about: true};
	history.pushState(s,'stuff','#about');
	$('.info').show();
});
});

// When a user goes back/forward in history to the main home page, ensure the info about the site is hidden
window.addEventListener('popstate', function(e) {
	var s = history.state;
	console.log(s);
      if (s === null || s.about !== true) {
		  $('.info').hide();
	  }
});

// When a user loads the home page in the /#about section, ensure info about the site is shown
$(document).ready(function() {
	var currentState = history.state;
	if (currentState !== null && currentState.about === true) {
		  $('.info').show();
	  }
});