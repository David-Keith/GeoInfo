/*
 * Code for the main home page
 */

// When a user clicks the about button, info about the site is shown if not already. This action is added to the history stack
$(document).ready(function() {
    $('#about').click(function() {
        // if info about the site is already displayed, do nothing
        if (history.state != null && history.state.about === true) return;

        // otherwise add an object to the history stack so it knows its on #about, and show the hidden view
        var aboutObject = {about: true};
        history.pushState(aboutObject, 'about', '#about');
        $('.info').show();
    });
});

// When a user goes back/forward in history to the main home page, ensure the info about the site is hidden
window.addEventListener('popstate', function(e) {
    var state = history.state;
    if (state === null || state.about !== true) {
        $('.info').hide();
    }
});

// When a user loads the home page in the /#about section, ensure info about the site is shown
$(document).ready(function() {
    var state = history.state;
    if (state !== null && state.about === true) {
        $('.info').show();
    }
});