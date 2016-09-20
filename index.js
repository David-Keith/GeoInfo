/*
 * Code for the main home page
 */

// When a user clicks the about button, info about the site is shown if not already. This action is added to the history stack
$(document).ready(function() {
    $('#about').click(function() {
        // if info about the site is already displayed, do nothing
        if (history.state != null && history.state.about === true) return;

        // otherwise show the hidden view and add the default hidden view to the history stack
        var s = {about: true};
        history.pushState(s,'stuff','#about');
        $('.info').show();
    });
});

// When a user goes back/forward in history to the main home page, ensure the info about the site is hidden
window.addEventListener('popstate', function(e) {
    var s = history.state;
    console.log(s);
    if (s === null || s.about !== true) {
        $('.info').hide();
    }
});

// When a user loads the home page in the /#about section, ensure info about the site is shown
$(document).ready(function() {
    var currentState = history.state;
    if (currentState !== null && currentState.about === true) {
        $('.info').show();
    }
});