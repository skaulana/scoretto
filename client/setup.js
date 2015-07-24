// Setup.js
// Client logic for first run

Template.nameprompt.events({
  'submit': function(e) {
    var name = $('#name').val();
    if (name.length > 0) {
      // seed a random UUID using persistent device storage
      Session.setPersistent('uuid', uuid.v4());
      Session.setPersistent('name', name);
      Meteor.call('connectWithUUID', Session.get('uuid'), name);
      Router.go('/game');
    }
    return false; // prevent default form action
  }
});