// Tutorial.js
// Client logic for tutorial walkthrough

Template.howitworks.events({
  'submit': function(e) {
    console.log($('#tutorialcheck').prop('checked'));
    if ($('#tutorialcheck').prop('checked')) {
      Session.setPersistent('rantutorial', true);
    }
    Router.go('/game');
    return false; // prevent default form action
  }
});