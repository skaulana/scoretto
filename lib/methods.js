// Methods.js
// Trusted server methods callable by clients

Meteor.methods({
  connectWithUUID: function (client, name, room) {
    var roomNumber = room || defaultRoom; // default to global room if not sent up
    ScoreboardStore.upsert(
      {client: client},
      {$set: {client: client, name: name, room: roomNumber},
        $setOnInsert: {score: 0, cards: 10}}
    );
  },
  disconnectWithUUID: function (client) {
    var roomNumber = ScoreboardStore.findOne({client: client}).room;
    ScoreboardStore.remove({client: client});
    // check for game state updates on the room the user just left
    if (Meteor.isServer) {
      sendPileSizesByRoom(roomNumber);
      resetScoresByRoom(roomNumber);
    }
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
    var roomNumber = ScoreboardStore.findOne({client: bootclient}).room;
    if (roomNumber != ScoreboardStore.findOne({client: client}).room) return;

    ScoreboardStore.remove({client: bootclient});
    // TODO: add a message that client booted bootclient...
    // check for game state updates on the room the user was just booted from
    if (Meteor.isServer) {
      sendPileSizesByRoom(roomNumber);
      resetScoresByRoom(roomNumber);
    }
  }
});
