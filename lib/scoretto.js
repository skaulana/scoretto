// Scoretto.js
// Startup and lib (first-loaded) code for client & server

appSemVer = "0.1.0";
defaultRoom = "000";

// Assuming autopublish of full DB for now...
ScoreboardStore = new Mongo.Collection("scores");

// Client startup logic
if (Meteor.isClient) {
  Meteor.startup(function() {
    if (Session.get('uuid') === undefined || Session.get('name') === undefined) {
      Router.go('/setup');
    }
    else {
      Meteor.call('connectWithUUID', Session.get('uuid'), Session.get('name'), Session.get('room'));
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

// Number of votes required to reset room's scores is 51%+ of room population
resetThreshold = function(roomNumber) {
  var total = ScoreboardStore.find({room: roomNumber}).count();
  if (Math.floor(total / 2) == total / 2) return (total / 2) + 1;
  else return Math.ceil(total / 2);
}

// Generates a room number based on client lat-long
findRoom = function() {
  var location = Geolocation.latLng();
  if (location == null) return defaultRoom;
  else {
    // first characters of the MD5 hash from concatenating part of lat-long
    return CryptoJS.MD5(
      location["lat"].toString().substr(0,6) + "," +
      location["lng"].toString().substr(0,6)
    )
      .toString()
      .substr(0, 3);
  }
}
