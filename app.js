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


