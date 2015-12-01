// Scoretto.js
// Startup and lib (first-loaded) code for client & server

appSemVer = "0.2.1";
defaultRoom = "000";

ScoreboardStore = new Mongo.Collection("scores");
TelemetryStore = new Mongo.Collection("usage");

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
  // pull down just the current room's members to client
  Meteor.autorun(function() {
    Meteor.subscribe("subScores", Session.get('room'));
  });
}

// Server startup logic
if (Meteor.isServer) {
  Meteor.startup(function () {
    // clear the global scoreboard on server startup
    ScoreboardStore.remove({});
  });
  Meteor.publish("subScores", function(roomNumber) {
    return roomNumber === undefined ? [] : ScoreboardStore.find({room: roomNumber});
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

// Extend date object to calculate week number
Date.prototype.getWeekNumber = function() {
  var dt = new Date(this.getTime());
  dt.setHours(0,0,0,0);
  dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7); // first Thursday definition
  var w1 = new Date(dt.getFullYear(),0,4); // January 4th in week 1
  return 1 + Math.round(((dt.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
}
