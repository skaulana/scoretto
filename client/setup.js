// Setup.js
// Client logic for first run

Template.nameprompt.helpers({
  name: function() {
    return Session.get('name');
  }
});

Template.nameprompt.events({
  'submit': function(e) {
    var name = $('#name').val();
    if (name.length > 0) {
      // seed a random UUID using persistent device storage
      Session.setPersistent('uuid', uuid.v4());
      Session.setPersistent('name', name);
      Meteor.call('connectWithUUID', Session.get('uuid'), name);
      if (Session.get('rantutorial') === undefined) {
        Router.go('/tutorial');
      }
      else {
        Router.go('/game');
      }
    }
    return false; // prevent default form action
  }
});