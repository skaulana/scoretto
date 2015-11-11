// Setup.js
// Client logic for first run

Template.nameprompt.helpers({
  name: function() {
    return Session.get('name');
  },
  lastscore: function() {
    return Session.get('lastscore');
  }
});

Template.aboutline.helpers({
  version: function() {
    // get the x.y from x.y.z semantic version
    return appSemVer.substring(0, appSemVer.lastIndexOf('.'));
  }
});

Template.nameprompt.events({
  'submit': function(e) {
    var name = $('#name').val();
    if (name.length > 0) {
      // seed a random UUID using persistent device storage
      Session.setPersistent('uuid', uuid.v4());
      Session.setPersistent('name', name);
      Session.set('lastscore', undefined);
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