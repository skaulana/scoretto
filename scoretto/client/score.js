// Score.js
// Client logic for scoring (input) screen

function findMe() { return ScoreboardStore.findOne({client: Session.get('uuid')}); }

Template.scoreprompt.helpers({
  lastround: function() {
    return (findMe().lastround === undefined) ? "" : findMe().lastround;
  },
  lastroundverb: function() {
    return (findMe().lastround === undefined) ? "Enter" : "Update";
  },
  scoresigncss: function() {
    var score = Session.get('scoreTyped');
    if (score < 0) return "btn-danger";
    else if (score > 0) return "btn-success";
    else return "btn-default";
  },
});

Template.scoreprompt.events({
  'change #score': function(e) {
    Session.set('scoreTyped', $('#score').val());
  },
  'click #scoresign': function(e) {
    var score = $('#score').val();
    // change the sign of a valid numeric score
    if (!isNaN(parseFloat(score)) && isFinite(score)) {
      $('#score').val(score * -1);
      Session.set('scoreTyped', score * -1);
    }
  },
  'submit': function(e) {
    var score = $('#score').val();
    // accept a score as long as it's numeric
    if (!isNaN(parseFloat(score)) && isFinite(score)) {
      Session.set('scoreTyped', undefined) // TODO: would be nice to leave set until round is scored
      Meteor.call('scoreRound', Session.get('uuid'), score);
      Router.go('/game');
    }
    return false; // prevent default form action
  }
});
