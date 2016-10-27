/*
 * Backend server code. Serves static pages in public directory (frontend)
 * and authenticates Firebase actions.
 */

/****************************************************************/ 
var express = require('express');
var gcloud = require('google-cloud');
var firebase = require('firebase');
var multer = require("multer");
var uploader = multer({ storage: multer.memoryStorage({}) });
var app = express();

// var bodyParser = require('body-parser')
// app.use(bodyParser.json());       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    // extended: true
// }));
var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true, parameterLimit:5000})); // to support URL-encoded bodies. parameter enlarged to store an entire forecast object

firebase.initializeApp({
    serviceAccount: "privkey.json",
    databaseURL: "https://my-project-1474597391583.firebaseio.com"
});

/****************************************************************
 * Google cloud storage part (provided code)
 ****************************************************************/
var CLOUD_BUCKET="my-project-1474597391583.appspot.com"; //From storage console, list of buckets
var gcs = gcloud.storage({
    projectId: '32110869379', //from storage console, then click settings, then "x-goog-project-id"
    keyFilename: 'privkey.json' //the key we already set up
});

function getPublicUrl (filename) {
    return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}

var bucket = gcs.bucket(CLOUD_BUCKET);

//From https://cloud.google.com/nodejs/getting-started/using-cloud-storage
function sendUploadToGCS (req, res, next) {
    if (!req.file) {
        return next();
    }

    var gcsname = Date.now() + req.file.originalname;
    var file = bucket.file(gcsname);


    var stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });

    stream.on('error', function (err) {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on('finish', function () {
        req.file.cloudStorageObject = gcsname;
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
        var options = {
            entity: 'allUsers',
            role: gcs.acl.READER_ROLE
        };
        file.acl.add(options, function(a,e){next();});//Make file world-readable; this is async so need to wait to return OK until its done
    });

    stream.end(req.file.buffer);
}

/****************************************************************/


// var fireRef = firebase.database().ref('users/' + sessionStorage.getItem("username") + '/' + 'savedLocations');
var fireRef = firebase.database().ref('users/'); //reference to the database for users data

app.set('port', (process.env.PORT || 5000));

// could also be done like this and port used later
// var port = process.env.PORT || 5000;

// app.get('/', function(request, response) {
  // response.render('pages/index');
// });

app.post('/test', function(req, res) {
	console.log("test received");
	console.log(req.body.age);
	// res.send("OK!", req);
	res.send({name: "jack"});
});

/* 
* Handles uploading a profile pic file to Google cloud storage
*/
app.post('/pic', uploader.single("img"), sendUploadToGCS, function (req, res, next) {
	var user = req.body.user; //the user whose profile pic will be updated
	var img; //will point to the link for the profile pic
	// If the request contained a file to upload, get a link to it
	if (req.file) {
		console.log("file upload requested");
		img = getPublicUrl(req.file.cloudStorageObject);
		// data.img = getPublicUrl(req.file.cloudStorageObject);
	}
	// Store the link to the pic in the database for the user
	fireRef.child(req.body.user).update({"img" : img}, function() {
			res.send("OK!");
		}).catch(function(){
			res.status(403);
			res.send();
    });
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
            res.status(403).send();
        });
});

/****************************************************************
* Server handling requests from main app
****************************************************************/
/*
* When a user requests to go to a saved location
*/
app.post('/goto', function(req, res) {
	var user = req.body.user;
	var key = req.body.key;
	var resp;
	console.log("goto request received user:", user, " key:", key);
	
	fireRef.child(user).child('savedLocations').child(key)
   .once("value")
	.then(function (snapshot) {
		// get the data for corresponding location
		resp = {lat: snapshot.val().latitude, lng: snapshot.val().longitude};
		console.log(resp);
		res.send(resp);
	});
});

// When a user requests to add a saved location
app.post('/savedLocation', function(req, res) {
	console.log("save location request received for", req.body.user);
	fireRef.child(req.body.user).child('savedLocations').push(req.body.savedLocation);
	res.send("OK!");
});

// When a user requests to delete a saved location
app.delete('/savedLocation', function(req, res) {
	console.log("remove location request received for", req.body.user);
	fireRef.child(req.body.user).child('savedLocations').child(req.body.key).remove();
	res.send("OK!");
});

/****************************************************************/

// Set the server to listen on the specified port
app.listen(app.get('port'), function () {
    console.log('Example app listening on port ', app.get('port'));
});

app.use(express.static('public'));