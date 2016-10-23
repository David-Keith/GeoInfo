/****************************************************************/
/****************************************************************/
/**
* Sample shell code to get started using node.js backend server
*/

// Add a sample test button that simulates logging in a user. Real login button will 
// need to actually read the username and password from the html log-in form.
ReactDOM.render(<button onClick={login}>testMe</button>,
	document.getElementById('BadLoginParent'));
//THIS RENDERING IS JUST DONE FOR TESTING, SHOULD NOT BE REPLACING BADLOGIN ELEMENT

	// this code doesn't work when using react/babel...
// $('#LoginForm').append('<button onClick ="login()">testMe</button>');

// Function to make RESTful ajax call to login. Result can simply be stored
// in sessionStorage cookie like done in validateLogin()
function login() {
	$.post("/login", {username: "david", password: "password"}, function(res) {
		console.log(res);
		if (res.valid) 
			console.log("login success!");
		else console.log("login fail");
	})
}

/****************************************************************/
/****************************************************************/

/**
 * To control the html login page
 */
"use strict";

$(document).ready(function () {
    if (sessionStorage.getItem("isLoggedIn") == undefined) {
        sessionStorage.setItem("isLoggedIn", "false");
    }

    // ReactDOM.render(
    //     <BadLogin username="" />,
    //     document.getElementById('BadLoginParent')
    // );
    $("#BadLogin").hide();


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

    // Run every 2 seconds to check if user is logged in
    var intervalID = setInterval(function () {
        if (sessionStorage.getItem("isLoggedIn") === "true") {

            goToApp();
        }
    }, 2000);

});

// Redirect user to application
function goToApp() {
    ReactDOM.render(
    <LoginMessage />,
        document.getElementById('UserLoggedIn')
);

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
                $("#BadRegisterParent").hide()
            }
            else { // User already in system
                ReactDOM.render(
                    <UserAlreadyExists username={username}/>,
                    document.getElementById('BadRegisterParent')
                );
                $("#BadRegisterParent").show();

            }
        })
        .catch(function(e){
            console.log(e);
        });

}

function validateLogin(usersRef, username, password) {
    var databasePassword;
    usersRef.child(username).child('password').once("value")
        .then( function(data){
            databasePassword = data.val();
            if (databasePassword === null ) { // User not in system or password wrong
                ReactDOM.render(
                    <BadLogin username={username} errorSelector="NoSuchUser"/>,
                    document.getElementById('BadLogin')
                );
                sessionStorage.setItem("isLoggedIn", "false");
                $("#BadLogin").show();
            }
            else if (password !== databasePassword) {
                ReactDOM.render(
                    <BadLogin username={username} errorSelector="BadPassword"/>,
                    document.getElementById('BadLogin')
                );
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

var LoginMessage = React.createClass({
    render: function () {
        return <p> Welcome, {sessionStorage.getItem("username")}! You are now logged in. </p>;
    }
});

var UserAlreadyExists = React.createClass({
    render: function () {
        return <p id="BadRegister">User {this.props.username} already exists. Please try another username.</p>;
    }
});

var BadLogin = React.createClass({
    render: function () {
        if (this.props.errorSelector ==="NoSuchUser") {
            return (
                <div id="BadLogin">
                    <NoSuchUser username={this.props.username}/>
                </div>
            );
        }
        else if (this.props.errorSelector ==="BadPassword") {
            return (
                <div id="BadLogin">
                    <BadPassword username={this.props.username}/>
                </div>
            );
        }
        else {
            return (
                <div id="BadLogin">
                </div>
            );
        }
    }
});


var NoSuchUser = React.createClass({
    render: function () {
        return <p id="NoSuchUer">User {this.props.username} doesn't exist.</p>;
    }
});

var BadPassword = React.createClass({
    render: function () {
        return <p id="BadPassword">Wrong password for {this.props.username}.</p>;
    }
});



