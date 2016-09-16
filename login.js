/**
 * To control the html login page
 */
        sessionStorage.isLoggedIn = false;

       $(Document).ready(function() {
           if (sessionStorage.isLoggedIn === false) {
               console.log(sessionStorage.isLoggedIn);
               goToApp();
           }
           else {
                $("#UserLoggedIn").hide();
           }

           // When the submit button is clicked
           $("#PasswordSubmit").click(function(){
               console.log(sessionStorage.isLoggedIn);
               sessionStorage.isLoggedIn = true;
               goToApp();
               console.log(sessionStorage.isLoggedIn);
           });
       });

// Redirect user to application
function goToApp(){
    $("#LoginForm").hide();
    $("#UserLoggedIn").show();
    window.setTimeout(function(){ window.location = "https://david-keith.github.io/GeoInfo/app" },3000);

    console.log("Went to app");
}