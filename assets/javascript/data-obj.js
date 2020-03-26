/******************************************************************************
 DATABASE OBJECT in JSON
 ******************************************************************************/
var gameboard = {
  'player1': {
    'id': null,
    'username': null,
    'choices': {},
    'wins': 0,
    'losses': 0
  },
  'player2': {
    'id': null,
    'username': null,
    'choices': {},
    'wins': 0,
    'losses': 0
  },
  'rounds': 0,
  'timestamp': firebase.database.ServerValue.TIMESTAMP 
}

/******************************************************************************
 SCRATCHPAD 
 ******************************************************************************/
/*
var dataRef = gameDB.ref().orderByChild('timestamp').limitToLast(1);

dataRef.once('value')
  .then(function(snapshot) {
    var childNode = snapshot.exists();

    // DEBUG:
    console.log(`Child node exists? ${childNode}`);

    if (snapshot.child('player2ID').exists()) {
      console.log('You do not have an opponent yet!')
    }
    else {
      gameDB.ref().push({
        player
      });
    }

    if (!snapshot.child('player2Choice').exists())
  });


/*
gameDB.ref().push({
  player1ID: game.getPlayerID(),
  player2ID: game.getOpponentID(),
  player1Choice: choice,
  player2Choice: null,
  roundWinner: null,
  roundLoser: null,
  timestamp: firebase.database.ServerValue.TIMESTAMP
});

// Listen for the most recent child.
gameID.orderByChild('timestamp').limitToLast(1).on('child_added', function(snapshot) {
  console.log(snapshot.key);
}, function(err) {
    console.log(`Error Code: ${err.code}`);
});
*/