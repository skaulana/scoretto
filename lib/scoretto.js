// Scoretto.js
// Startup and lib (first-loaded) code for client & server

// Assuming autopublish of full DB for now...
ScoreboardStore = new Mongo.Collection("scores");

// Client startup logic
if (Meteor.isClient) {
  Meteor.startup(function() {
    if (Session.get('uuid') === undefined || Session.get('name') === undefined) {
      Router.go('/setup');
    }
    else {
      Meteor.call('connectWithUUID', Session.get('uuid'), Session.get('name'));
      Router.go('/game');
    }
  });
}

// Server startup logic
if (Meteor.isServer) {
  Meteor.startup(function () {
    // clear the global scoreboard on server startup
    ScoreboardStore.remove({});
  });
}

// Number of votes required to reset all scores is 51%+
resetThreshold = function() {
  var total = ScoreboardStore.find().count();
  if (Math.floor(total / 2) == total / 2) return (total / 2) + 1;
  else return Math.ceil(total / 2);
}
