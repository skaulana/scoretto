// Game.js
// Client logic for main game (scoreboard) screen

// shorthand DB calls
function allScored() { return ScoreboardStore.find({lastround: {$exists: true}}).count(); }
function iScored() { return ScoreboardStore.find({lastround: {$exists: true}, client: Session.get('uuid')}).count(); }
function allVoted() { return ScoreboardStore.find({reset: {$exists: true}}).count(); }
function iVoted() { return ScoreboardStore.find({reset: {$exists: true}, client: Session.get('uuid')}).count(); }
function findMe() { return ScoreboardStore.findOne({client: Session.get('uuid')}); }

Template.gametitle.helpers({
  title: function() {
    if (iScored() == 0 && allScored() == 0) {
      var cards = findMe().cards;
      return "Deal " + cards + " card" + (cards == 1 ? "" : "s") + ", "
        + Session.get('name');
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
    var noScores = iScored() == 0 && allScored() == 0;
    var needMyScore = iScored() == 0;
    var votePending = allVoted() != 0;
    var needOtherScores = allScored() < ScoreboardStore.find().count();

    if (votePending) return resetThreshold() + " votes needed to reset scores"; 
    else if (noScores) return "";
    else if (needMyScore) return "Waiting for your score from last round";
    else if (needOtherScores) return "Waiting for others to finish scoring";
    else return "Waiting for the server";
  },
  resetcss: function() {
    return iVoted() ? "btn-warning" : "btn-default";
  },
  resetstring: function() {
    return iVoted() ? "<span class='glyphicon glyphicon-ok'></span> Reset" : "Reset";
  }
});
  
Template.gameactions.events({
  'click #scoreround': function(e) {
    Router.go('/score');
  },
  'click #votereset': function(e) {
    Meteor.call('toggleReset', Session.get('uuid'));
  },
  'click #exitgame': function(e) {
    Meteor.call('disconnectWithUUID', Session.get('uuid'));
    Session.clear();
    Router.go('/setup'); // TODO: replay client startup logic instead
  }
});