/******************************************************************************
 DATABASE OBJECT in JSON
 ******************************************************************************/
var gameboard = {
  'player1': {
    'id': null,
    'username': null,
    'wins': 0,
    'losses': 0
  },
  'player2': {
    'id': null,
    'username': null,
    'wins': 0,
    'losses': 0
  },
  'rounds': 0,
  'choices': {},
  'waiting:': true,
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

dbFuncs.dataRef.onWrite(event => {
  return event.data.ref.update({
    [`${game}`] : {
      [`player${playerPos}`]: { 
        id: playerID,
        username: `Player ${playerPos}`
      },
      waiting: true,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    }
  }).then(() => {
      console.log('Database update succeeded. Proceeding ...')
  });
});
*/

/*
setGameID() {
  var dataRef = this.#db.ref(),
      gameID = dataRef.push(),
      playerID = this.#playerID,
      playerPos = this.#playerPos;

  console.log("Can I do this?" + dataRef.orderByValue().limitToLast(1));

  dataRef.orderByValue().limitToLast(1).once('child_added').then(snapshot => {
    // DEBUG:
    console.log(snapshot.child('waiting').val());
    
    if (snapshot.child('waiting').val()) {
      snapshot.ref.update({
        [`${game}`]: {
          [`player${playerPos}`]: { 
            id: playerID,
            username: `Player ${playerPos}`
          },
          waiting: true,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      });        
    }
    
  });
  /*    ,
      player1 = this.#db.ref('player1');

  console.log(`dataRef = ${dataRef}`);
  console.log(`player1 = ${player1}`);

  player1.once('value')
    .then(function(snapshot) {
      if (snapshot.exists()) {
        // DEBUG:
        console.log("ASSERT: This game has a player1.");

        var player1ID = dataRef.child('player1/id').equalTo(playerID);

        // Check if this player is `player1`.
        player1ID.once('value')
          .then(function(snapshot) {
            // If this player's ID is found in the `player1.id` field, 
            // set the data reference accordingly and return.
            if (snapshot.exists()) {
              // DEBUG:
              console.log("ASSERT: This player is player1.");                
              
              gameID = snapshot.key();
            }
            else {
              var player2 = dataRef.child('player2');

              player2.once('value')
                .then(function(snapshot) {

                  if (snapshot.exists()) {
                    // DEBUG:
                    console.log("ASSERT: This game has a player2.");
                    
                    var player2ID = dataRef.child('player2/id').equalTo(playerID);
      
                    player2ID.once('value')
                      .then(function(snapshot) {
                        // If this player's ID is found in the `player2.id` field,
                        // set the data reference accordingly.
                        if(snapshot.exists()) {
                          // DEBUG:
                          console.log("ASSERT: This player is player2.");

                          playerPos = 2;
                          gameID = snapshot.key();
                        }
                      });
                  }
                  else {
                    // ASSERT: This game doesn't have a second player
                    // DEBUG:
                    console.log("ASSERT: This game doesn't have a player2");
                    
                    playerPos = 2;

                    gameID = dataRef.update({
                      [`player${playerPos}`]: { 
                        id: playerID,
                        username: `Player ${playerPos}`
                      },              
                    });
                  }      
                });  
            }
          });
      }
      else {
        // ASSERT: A game doesn't exist so create a new one.
        console.log("ASSERT: This is a new game.");
        /*
        var now = new Date(),
        game = `game-${now.getTime()}-${Math.floor(Math.random() * 1000000)}`;

        dataRef.update({
          [`${game}`]: {
            [`player${playerPos}`]: { 
              id: playerID,
              username: `Player ${playerPos}`
            },
            waiting: true,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          }
        });
       
        gameID = `${dataRef}/${game}`;
      /*}
    });

  this.#gameID = gameID;

  console.log("this.#gameID = " + this.#gameID);

  this.#playerPos = playerPos;
}
*/