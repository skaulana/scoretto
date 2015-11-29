// Handleround.js
// Server code to watch for when all players have scored the last round

var sendPileSizes = function(id, fields) {
  if (fields) return sendPileSizesByRoom(ScoreboardStore.findOne(id).room);
};

sendPileSizesByRoom = function(roomNumber) {
  if (ScoreboardStore.find({room: roomNumber, lastround: {$exists: true}}).count()
      == ScoreboardStore.find({room: roomNumber}).count()) {

    var scores = ScoreboardStore.find({room: roomNumber}, {sort: {score: 1}}).fetch();
    if (scores == false) return; // empty game
    var minscore = scores[0].score;

    // clear lastround values from DB first to avoid race
    ScoreboardStore.update({room: roomNumber}, {$unset: {lastround: ""}}, {multi: true});

    // then send down correct pile count: +1 per 5 over 10 from min score
    for (var i = 0; i < scores.length; i++) {
      var newcards = 10;          
      if (scores[i].score > minscore + 10) {
        newcards += Math.ceil((scores[i].score - minscore - 10 + 1) / 5);
      }
      ScoreboardStore.update({client: scores[i].client}, {$set: {cards: newcards}});
    }
    
    // then count the round as scored
    var d = new Date();
    TelemetryStore.upsert(
      {year: d.getFullYear(), week: d.getWeekNumber()},
      {$setOnInsert: {year: d.getFullYear(), week: d.getWeekNumber(), rounds: 0},
       $inc: {rounds: 1}}
    );
  }
};

handlePileSizes = ScoreboardStore.find().observeChanges({
  changed: sendPileSizes
});