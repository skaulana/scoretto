// DB access - assuming insecure and autopublish for now...
ScoreboardStore = new Mongo.Collection("scores");

// Routing
Router.configure({layoutTemplate: 'main'});
Router.route('/', function() {
  this.render('loading', {to: 'header'});
});
Router.route('/setup', function() {
  this.render('hello', {to: 'header'});
  this.render('nameprompt', {to: 'body'});
});
Router.route('/game', function() {
  this.render('gametitle', {to: 'header'});
  this.render('', {to: 'body'});
  this.render('', {to: 'footer'});
});

// Client logic
if (Meteor.isClient) {
  Meteor.startup(function() {
    if (Session.get('uuid') === undefined) {
      // for now, assume if we don't have a UUID we need user's name too
      Router.go('/setup');
    }
    else {
      Meteor.call('connectWithUUID', Session.get('uuid'));
      Router.go('/game');
    }
  });
  
  Template.nameprompt.events({
    'submit': function(e) {
      var name = $('#name').val();
      if (name.length > 0) {
        // seed a random UUID using persistent device storage
        Session.setPersistent('uuid', uuid.v4());
        Meteor.call('connectWithUUID', Session.get('uuid'), name);
        Router.go('/game');
      }
      return false; // prevent default form action
    }
  });
  
  Template.gametitle.helpers({
    title: function() {
      var players = ScoreboardStore.find().count();
      return players + " player" + (players == 1 ? "" : "s");
    }
  });
}

// Trusted methods
Meteor.methods({
  connectWithUUID: function (clientid, name) {
    var payload = {$set: {client: clientid}, $setOnInsert: {score: 0}};
    if (name !== undefined) payload["$set"]["name"] = name; // send name when passed as arg
    // console.log('Client connecting as ' + clientid);
    ScoreboardStore.upsert({client: clientid}, payload);
  }
});

// Server logic
if (Meteor.isServer) {
  Meteor.startup(function () {
    // clear the global scoreboard on server startup
    ScoreboardStore.remove({});
  });
}
