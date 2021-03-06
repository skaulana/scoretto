// Game.js
// Client logic for main game (scoreboard) screen

// shorthand DB calls
function allScored() { return ScoreboardStore.find({room: Session.get('room'), lastround: {$exists: true}}).count(); }
function iScored() { return ScoreboardStore.find({room: Session.get('room'), lastround: {$exists: true}, client: Session.get('uuid')}).count(); }
function allVoted() { return ScoreboardStore.find({room: Session.get('room'), reset: {$exists: true}}).count(); }
function iVoted() { return ScoreboardStore.find({room: Session.get('room'), reset: {$exists: true}, client: Session.get('uuid')}).count(); }
function findMe() { return ScoreboardStore.findOne({client: Session.get('uuid')}); }

Template.gametitle.helpers({
  title: function() {
    if (iScored() == 0 && allScored() == 0) {
      if (findMe() === undefined) Router.go('/setup'); // you got booted
      var cards = findMe() === undefined ? 10 : findMe().cards;
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
    var players = ScoreboardStore.find({room: Session.get('room')}, {sort: {score: -1}});
    if (ScoreboardStore.find({room: Session.get('room'),
                              client: Session.get('uuid')}).count() == 0) {
      Router.go('/setup'); // handles if current player left or was booted
    }
    else return players;
  },
  soloplayer: function() {
    return ScoreboardStore.find({room: Session.get('room')}).count() == 1;
  },
  room: function() {
    return Session.get('room');
  },
  selectedcss: function() {
    if (this.client == Session.get('playerid')) return "active"; // TODO: always prefer Session.equals()
    else return "";
  },
  icon: function() {
    return this.name === undefined
       ? "?" : this.name.charAt(0); // TODO: use actual images later
  },
  lastroundsign: function() {
    return this.lastround !== undefined && this.lastround >= 0 ? "+" : "";
  }
});

Template.userlist.events({
  'click li': function(e) {
    var clickedplayer = $(e.currentTarget).data('playerid'); // use currentTarget to ensure data-playerid always binds
    if (clickedplayer == Session.get('uuid')) return false; // don't allow selecting self
    else if (clickedplayer == Session.get('playerid')) Router.go('/game'); // unselect player
    else Router.go('/game/' + clickedplayer); // select player
  }
});
  
Template.gameactions.helpers({
  message: function() {
    var noScores = iScored() == 0 && allScored() == 0;
    var needMyScore = iScored() == 0;
    var votePending = allVoted() != 0;
    var needOtherScores = allScored() < ScoreboardStore.find({room: Session.get('room')}).count();
    var needOtherVotes = allVoted() < ScoreboardStore.find({room: Session.get('room')}).count();

    if (votePending) {
      if (needOtherVotes) return resetThreshold(Session.get('room')) + " votes needed to reset scores";
      else return "<img src='/loading.gif'> Waiting for the server";
    }
    else if (noScores) return "";
    else if (needMyScore) return "Waiting for your score from last round";
    else if (needOtherScores) return "Waiting for others to finish scoring";
    else return "<img src='/loading.gif'> Waiting for the server";
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
    Session.set('lastscore', findMe().score);
    Meteor.call('disconnectWithUUID', Session.get('uuid'));
    Session.set('uuid', undefined);
    Session.set('playerid', undefined);
    Router.go('/setup'); // TODO: replay client startup logic instead
  }
});

Template.useractions.helpers({
  bootname: function() {
    if (this.name) return this.name; // passed as data in routes.js
    Router.go('/game'); // prevents stale UI if selected player leaves
  }
});

Template.useractions.events({
  'click #voteboot': function(e) {
    Meteor.call('bootUUID', Session.get('uuid'), Session.get('playerid'));
    Router.go('/game');
  },
  'click #backtogame': function(e) {
    Router.go('/game');
  }
});