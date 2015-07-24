// Handlereset.js
// Server code to watch for when a majority of players have voted to reset

var resetAllScores = function(id, fields) {
  if (ScoreboardStore.find({reset: {$exists: true}}).count() >= resetThreshold()) {
    ScoreboardStore.update(
      {},
      {$unset: {lastround: "", reset: ""}, $set: {score: 0}},
      {multi: true});
  }
};

handleResetScores = ScoreboardStore.find().observeChanges({
  changed: resetAllScores,
  removed: resetAllScores
});