/**
 * To control the html login page
 */
"use strict";
$(document).ready(function () {
    if (sessionStorage.getItem("isLoggedIn") == undefined) {
        sessionStorage.setItem("isLoggedIn", "false");
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
    var usersRef = firebase.database().ref('users');
    // registerUser(usersRef, "jim", "secret_password");
    // var validLogin = validateLogin(usersRef, "tim", "secret_password");

    // When the login submit button is clicked
    $("#PasswordSubmit").click(function () {
        var username = $("#usernameInput").val();
        var password = $("#passwordInput").val();
        validateLogin(usersRef, username, password);
    });

    // When the register submit button is clicked
    $("#RegisterSubmit").click(function () {
        var username = $("#usernameRegister").val();
        var password = $("#passwordRegister").val();
        registerUser(usersRef, username, password);
    });

    // When the register submit button is clicked
    $("#FirebaseSet").click(function () {
        var username = $("#usernameRegister").val();
        var password = $("#passwordRegister").val();
        firebaseSet(usersRef, username, password);
    });

    // When the register submit button is clicked
    $("#FirebasePush").click(function () {
        var username = $("#usernameRegister").val();
        var password = $("#passwordRegister").val();
        firebasePush(usersRef, username, password);
    });




    // Run every 2 seconds to check if user is logged in
    var intervalID = setInterval(function () {
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            goToApp();
        }
    }, 2000);

});

// Redirect user to application
function goToApp() {
    $("#LoginForm").hide();
    $("#RegisterForm").hide();
    $("#UserLoggedIn").show();

    // Go to app after 3.5 seconds
    window.setTimeout(function () {
        window.location = "app.html"
    }, 3500);
}

function registerUser(usersRef, username, password) {
    // var userObject = {
      // [username]: password
    // };
	
    usersRef.child(username).once("value")
        .then( function(data){
            if (data.val() === null)  { // User not in system
				usersRef.child(username).set({
					password : password
				});
                // usersRef.update(userObject); // Add user to database
                $("#BadRegister").hide()
            }
            else { // User already in system
                $("#BadRegister").show();
            }
        })
        .catch(function(e){
            console.log(e);
        });

}

function firebaseSet(usersRef, username, password) {
    var userObject = {
        [username]: password
    };
    usersRef.set(userObject);
}

function firebasePush(usersRef, username, password) {
    var userObject = {
        "username": username,
        "password": password
    };
    usersRef.push(userObject);
}

function validateLogin(usersRef, username, password) {
    var databasePassword;
    usersRef.child(username).child('password').once("value")
        .then( function(data){
            databasePassword = data.val();
            if (databasePassword === null || password !== databasePassword) { // User not in system or password wrong
                sessionStorage.setItem("isLoggedIn", "false");
                $("#BadLogin").show();
            }
            else {
                sessionStorage.setItem("isLoggedIn", "true");
				sessionStorage.setItem("username", username);
                $("#BadLogin").hide();
            }

        })
        .catch(function(e){
            console.log(e);
        });
}
