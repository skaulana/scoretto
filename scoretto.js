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
  this.render('', {to: 'footer'});
});
Router.route('/game', function() {
  this.render('gametitle', {to: 'header'});
  this.render('userlist', {to: 'body'});
  this.render('gameactions', {to: 'footer'});
});
Router.route('/score', function() {
  this.render('scoretitle', {to: 'header'});
  this.render('scoreprompt', {to: 'body'});
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
      var allScored = ScoreboardStore.find({lastround: {$exists: true}}).count();
      var iScored = ScoreboardStore.find({lastround: {$exists: true}, client: Session.get('uuid')}).count();

      if (iScored == 0 && allScored == 0) { // TODO: consolidate with gameactions.helpers
        var cards = ScoreboardStore.findOne({client: Session.get('uuid')}).cards;
        return "Draw " + cards + " card" + (cards == 1 ? "" : "s");
      }
      else {
        return "Get ready for next round...";
      }
    }
  });
  
  Template.userlist.helpers({
    players: function() {
      var players = ScoreboardStore.find({}, {sort: {score: -1}});
      if (players.count() == 0) Router.go('/setup'); // resets client quickly during debugging
      else return players;
    },
    icon: function() {
      return this.name === undefined
         ? "[☺]"
         : "[" + this.name.charAt(0) + "]"; // TODO: use actual images later
    },
    lastroundsign: function() {
      return this.lastround !== undefined && this.lastround >= 0 ? "+" : "";
    }
  });
  
  Template.gameactions.helpers({
    message: function() {
      var allScored = ScoreboardStore.find({lastround: {$exists: true}}).count();
      var iScored = ScoreboardStore.find({lastround: {$exists: true}, client: Session.get('uuid')}).count();

      var noScores = iScored == 0 && allScored == 0;
      var needMyScore = iScored == 0;
      var needOtherScores = allScored < ScoreboardStore.find().count();
      
      if (noScores) return "";
      else if (needMyScore) return "Waiting for your score from last round";
      else if (needOtherScores) return "Waiting for others to finish scoring";
      else return "Waiting for the server";
    }
  });
  
  Template.gameactions.events({
    'click #scoreround': function(e) {
      Router.go('/score');
    },
    'click #exitgame': function(e) {
      Meteor.call('disconnectWithUUID', Session.get('uuid'));
      Session.clear();
      Router.go('/setup'); // TODO: replay client startup logic instead
    }
  });
  
  Template.scoreprompt.events({
    'submit': function(e) {
      var score = $('#score').val();
      // accept a score as long as it's numeric
      if (!isNaN(parseFloat(score)) && isFinite(score)) {
        Meteor.call('scoreRound', Session.get('uuid'), score);
        Router.go('/game');
      }
      return false; // prevent default form action
    }
  });
}

// Trusted methods
Meteor.methods({
  connectWithUUID: function (clientid, name) {
    var payload = {$set: {client: clientid}, $setOnInsert: {score: 0, cards: 10}};
    if (name !== undefined) payload["$set"]["name"] = name; // send name when passed as arg
    // console.log('Client connecting as ' + clientid);
    ScoreboardStore.upsert({client: clientid}, payload);
  },
  disconnectWithUUID: function (clientid) {
    ScoreboardStore.remove({client: clientid});
  },
  scoreRound: function (clientid, score) {
    ScoreboardStore.update(
      {client: clientid},
      {$set: {lastround: score}, $inc: {score: parseInt(score)}}
    );
  }
});

// Server logic
if (Meteor.isServer) {
  Meteor.startup(function () {
    // clear the global scoreboard on server startup
    ScoreboardStore.remove({});
  });
  
  // watch for all players to have scored the last round
  var handlePileSizes = ScoreboardStore.find().observeChanges({
    changed: function(id, fields) {
      if (ScoreboardStore.find({lastround: {$exists: true}}).count()
        == ScoreboardStore.find().count()) {
        
        var scores = ScoreboardStore.find({}, {sort: {score: 1}}).fetch();
        var minscore = scores[0].score;
        
        // clear lastround values from DB first to avoid race
        ScoreboardStore.update({}, {$unset: {lastround: ""}}, {multi: true});
        
        // then send down correct pile count: +1 per 5 over 10 from min score
        for (var i = 0; i < scores.length; i++) {
          var newcards = 10;          
          if (scores[i].score > minscore + 10) {
            newcards += Math.ceil((scores[i].score - minscore - 10 + 1) / 5);
          }
          ScoreboardStore.update({client: scores[i].client}, {$set: {cards: newcards}});
        }
      }
    }
  });
}
