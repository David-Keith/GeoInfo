/**
 * To control the html login page
 */
$(document).ready(function () {
    if (sessionStorage.getItem("isLoggedIn") == undefined) {
        sessionStorage.setItem("isLoggedIn", "false");
    }
    // When the submit button is clicked
    $("#PasswordSubmit").click(function () {
        sessionStorage.setItem("isLoggedIn", "true");
        // goToApp();
    });

    // Run every 2 seconds to check if user is logged in
    var intervalID = setInterval(function () {
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            goToApp();
        }
    }, 2000);

    // Redirect user to application
    function goToApp() {
        $("#LoginForm").hide();
        $("#UserLoggedIn").show();

        // Go to app after 3.5 seconds
        window.setTimeout(function () {
            window.location = "app.html"
        }, 3500);
    }
});

