// Methods.js
// Trusted server methods callable by clients

Meteor.methods({
  connectWithUUID: function (clientid, name) {
    var payload = {$set: {client: clientid}, $setOnInsert: {score: 0, cards: 10}};
    if (name !== undefined) payload["$set"]["name"] = name; // send name when passed as arg
    // console.log('Client connecting as ' + clientid);
    ScoreboardStore.upsert({client: clientid}, payload);
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
