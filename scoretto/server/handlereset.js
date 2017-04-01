// Handlereset.js
// Server code to watch for when a majority of players have voted to reset

var resetRoomScores = function(id, fields) {
  if (fields) return resetScoresByRoom(ScoreboardStore.findOne(id).room);
};

resetScoresByRoom = function(roomNumber) {
  if (ScoreboardStore.find({room: roomNumber, reset: {$exists: true}}).count()
      >= resetThreshold(roomNumber)) {
    ScoreboardStore.update(
      {room: roomNumber},
      {$unset: {lastround: "", reset: ""}, $set: {score: 0, cards: 10}},
      {multi: true});
  }
};

handleResetScores = ScoreboardStore.find().observeChanges({
  changed: resetRoomScores
});