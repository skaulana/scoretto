// Handleround.js
// Server code to watch for when all players have scored the last round

var sendPileSizes = function(id, fields) {
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
};

handlePileSizes = ScoreboardStore.find().observeChanges({
  changed: sendPileSizes,
  removed: sendPileSizes
});