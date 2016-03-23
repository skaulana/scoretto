// Tutorial.js
// Client logic for tutorial walkthrough

Template.howitworks.events({
  'submit': function(e) {
    if ($('#tutorialcheck').prop('checked')) {
      Session.setPersistent('rantutorial', true);
    }
    Router.go('/game');
    return false; // prevent default form action
  }
});