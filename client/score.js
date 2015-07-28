// Score.js
// Client logic for scoring (input) screen

function findMe() { return ScoreboardStore.findOne({client: Session.get('uuid')}); }

Template.scoreprompt.helpers({
  lastround: function() {
    return (findMe().lastround === undefined) ? "" : findMe().lastround;
  },
  lastroundverb: function() {
    return (findMe().lastround === undefined) ? "Enter" : "Update";
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