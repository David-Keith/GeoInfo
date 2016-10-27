/****************************************************************/
/****************************************************************/
/**
* Sample shell code to get started using node.js backend server
*/

// Add a sample test button that simulates logging in a user. Real login button will 
// need to actually read the username and password from the html log-in form.

// ReactDOM.render(<button onClick={login}>testMe</button>,
// 	document.getElementById('BadLoginParent'));

//THIS RENDERING IS JUST DONE FOR TESTING, SHOULD NOT BE REPLACING BADLOGIN ELEMENT

	// this code doesn't work when using react/babel...
// $('#LoginForm').append('<button onClick ="login()">testMe</button>');

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

    $("#BadLogin").hide();



    // When the login submit button is clicked
    $("#PasswordSubmit").click(function () {
        var username = $("#usernameInput").val();
        var password = $("#passwordInput").val();
        validateLogin(username, password);
    });

    // When the register submit button is clicked
    $("#RegisterSubmit").click(function () {
        var username = $("#usernameRegister").val();
        var password = $("#passwordRegister").val();
        registerUser(username, password);
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

function registerUser(username, password) {
    $.post("/register", {username: username, password: password}, function(res) {
        console.log(res);
        if (res.valid) {
            // usersRef.update(userObject); // Add user to database
            $("#BadRegisterParent").hide()
        }
        else {
            ReactDOM.render(
                <UserAlreadyExists username={username}/>,
                document.getElementById('BadRegisterParent')
            );
            $("#BadRegisterParent").show();
        }
    })
}

function validateLogin(username, password) {
    $.post("/login", {username: username, password: password}, function(res) {
        console.log(res);
        if (res.valid) {
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("username", username);
            $("#BadLogin").hide();
        }
        else {
            console.log("bad");
            ReactDOM.render(
                <BadLogin username={username} errorSelector="NoSuchUser"/>,
                document.getElementById('BadLogin')
            );
            sessionStorage.setItem("isLoggedIn", "false");
            $("#BadLogin").show();

        }
    })
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
        console.log("render");
        if (this.props.errorSelector ==="NoSuchUser") {
            return (
                <div id="BadLogin">
                    <NoSuchUser username={this.props.username}/>
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
        return <p id="NoSuchUer">User {this.props.username} doesn't exist. Or wrong login information for the user.</p>;
    }
});
