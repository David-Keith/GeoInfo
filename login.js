/**
 * To control the html login page
 */

       $(document).ready(function() {
           sessionStorage.setItem("isLoggedIn", false);
           sessionStorage.isLoggedIn = "false";

           // if (sessionStorage.isLoggedIn.valueOf() === "true") {
           // if(sessionStorage.getItem("isLoggedIn"))
           //     console.log("isLoggedIn: " + sessionStorage.isLoggedIn);
           //     goToApp();
           // }
           // When the submit button is clicked
           $("#PasswordSubmit").click(function(){
               sessionStorage.setItem("isLoggedIn", true);
               // goToApp();
           });

           var intervalID = setInterval(function() {
               if (sessionStorage.getItem("isLoggedIn")) {
                   goToApp();
               }
           }, 2000);

           // Redirect user to application
           function goToApp(){
               $("#LoginForm").hide();
               $("#UserLoggedIn").show();
               window.setTimeout(function(){ window.location = "https://david-keith.github.io/GeoInfo/app" },5000);
           }
       });

