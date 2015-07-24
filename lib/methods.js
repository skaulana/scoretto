// Methods.js
// Trusted server methods callable by clients

Meteor.methods({
  connectWithUUID: function (clientid, name) {
    ScoreboardStore.upsert(
      {client: clientid},
      {$set: {client: clientid}, $setOnInsert: {score: 0, cards: 10}}
    );
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
