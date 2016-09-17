/**
 * To control the html login page
 */
       $(document).ready(function() {
           if(sessionStorage.getItem("isLoggedIn") == undefined) {
               sessionStorage.setItem("isLoggedIn", "false");
           }
           var loggedIn = "false;"
           // if (sessionStorage.isLoggedIn.valueOf() === "true") {
           // if(sessionStorage.getItem("isLoggedIn"))
           //     console.log("isLoggedIn: " + sessionStorage.isLoggedIn);
           //     goToApp();
           // }
           // When the submit button is clicked
           $("#PasswordSubmit").click(function(){
               sessionStorage.setItem("isLoggedIn", "true");
               loggedIn = "true";
               // goToApp();
           });

           var intervalID = setInterval(function() {
               console.log(sessionStorage.getItem("isLoggedIn"));
               if (sessionStorage.getItem("isLoggedIn") === "true") {
                   goToApp();
               }
               if(loggedIn === "true")
               {
                   console.log(loggedIn);
               }
           }, 2000);

           // Redirect user to application
           function goToApp(){
               $("#LoginForm").hide();
               $("#UserLoggedIn").show();
               window.setTimeout(function(){ window.location = "app.html" },5000);
           }
       });

