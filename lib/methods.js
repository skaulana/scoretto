// Methods.js
// Trusted server methods callable by clients

Meteor.methods({
  connectWithUUID: function (client, name) {
    ScoreboardStore.upsert(
      {client: client},
      {$set: {client: client, name: name}, $setOnInsert: {score: 0, cards: 10}}
    );
  },
  disconnectWithUUID: function (client) {
    ScoreboardStore.remove({client: client});
  },
  scoreRound: function (client, score) {
    var currentClient = ScoreboardStore.findOne({client: client});
    if (currentClient.lastround === undefined) {
      ScoreboardStore.update(
        {client: client},
        {$set: {lastround: score}, $inc: {score: parseInt(score)}}
      );
    }
    else {
      ScoreboardStore.update(
        {client: client},
        {$set: {lastround: score, score: parseInt(currentClient.score) - parseInt(currentClient.lastround) + parseInt(score)}}
      );
    }
  },
  toggleReset: function (client) {
    if (ScoreboardStore.findOne({client: client}).reset === undefined) {
      ScoreboardStore.update({client: client}, {$set: {reset: true}});
    }
    else {
      ScoreboardStore.update({client: client}, {$unset: {reset: ""}});
    }
  },
  bootUUID: function (client, bootclient) {
    ScoreboardStore.remove({client: bootclient});
    // TODO: add a message that client booted bootclient...
  }
});
