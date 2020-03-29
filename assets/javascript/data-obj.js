/******************************************************************************
 DATABASE OBJECT in JSON
 ******************************************************************************/
var gameboard = {
  'player1': {
    'id': null,
    'username': null,
    'choice': null,
    'wins': 0,
    'losses': 0
  },
  'player2': {
    'id': null,
    'username': null,
    'choice': null,
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
  db.once('child_added').then(snapshot => {
    // console.log('A child was added!');
    // console.log(snapshot.ref.toString());

    snapshot.forEach(childSnapshot => {
      // console.log(`${childSnapshot.key}: ${childSnapshot.val()}`);
    });

  }), function(err) {
    console.log(`Error Code: ${err.code}`);
  };

  if (player2Choice) {
    gameRef.update({
      rounds: rounds
    });

    db.ref(`${game.getGameID()}/choices`).transaction(currentData => {
        return { [`round${rounds}`]: { player1: player1Choice, player2: player2Choice } };
    }, (err, committed, snapshot) => {
      if (err) {
        console.log(`Database transaction failed due to Error ${err}`);
      } else if (!committed) {
        console.log('Database transacton aborted.');
      } else {
        console.log('Data successfully added to database.');
      }
    });
  }
*/