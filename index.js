/*
 * Backend server code. Serves static pages in public directory (frontend)
 * and authenticates Firebase actions.
 */

/****************************************************************/ 
var firebase = require("firebase");
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// var port = process.env.port || 3000;

firebase.initializeApp({
    serviceAccount: "privkey.json",
    databaseURL: "https://my-project-1474597391583.firebaseio.com"
});
// var fireRef = firebase.database().ref('users/' + sessionStorage.getItem("username") + '/' + 'savedLocations');
var fireRef = firebase.database().ref('users/');

app.set('port', (process.env.PORT || 5000));

// app.get('/', function(request, response) {
  // response.render('pages/index');
// });

app.post('/test', function(req, res) {
	console.log("test received");
	console.log(req.body.age);
	// res.send("OK!", req);
	res.send({name: "jack"});
});

/****************************************************************
* Server function to handle a request to log in a user. Reads a username and
* password from client, validates that account on firebase, and responds to
* the client with success or failure.
****************************************************************/
app.post('/login', function(req, res) {
	var username = req.body.username; //username client submitted
	var password = req.body.password; //password client submitted
	var databasePassword; //will hold the password firebase finds for a given user
	var resp = {valid: false}; //response object to send back to client after validation
	console.log("login request received");
	console.log(username, password);
	
    fireRef.child(username).child('password').once("value")
        .then( function(data){
            databasePassword = data.val();
            if (databasePassword === null || password !== databasePassword) { // User not in system or password wrong
				console.log("Invalid Firebase account");
				res.send(resp);
            }
            else {
                resp.valid = true;
				console.log("Valid Firebase account");
				res.send(resp);
            }

        })
        .catch(function(e){
            console.log(e);
        });
});

// Set the server to listen on the specified port
app.listen(app.get('port'), function () {
    console.log('Example app listening on port ', app.get('port'));
});

/****************************************************************/

app.use(express.static('public'));