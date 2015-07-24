// Game.js
// Client logic for main game (scoreboard) screen

Template.gametitle.helpers({
  title: function() {
    var allScored = ScoreboardStore.find({lastround: {$exists: true}}).count();
    var iScored = ScoreboardStore.find({lastround: {$exists: true}, client: Session.get('uuid')}).count();

    if (iScored == 0 && allScored == 0) { // TODO: consolidate with gameactions.helpers
      var cards = ScoreboardStore.findOne({client: Session.get('uuid')}).cards;
      return "Deal " + cards + " card" + (cards == 1 ? "" : "s") + ", "
        + ScoreboardStore.findOne({client: Session.get('uuid')}).name;
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
       ? "?" : this.name.charAt(0); // TODO: use actual images later
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