/******************************************************************************
FSWD:  Christopher B. Zenner
Date:  03/28/2020
File:  rps.js
Ver.:  0.1.0 20200328
       
This JS script implements a two-player Rock Paper Scissors game app. For each
round, each player will pick rock, paper, or scissors by clicking the ap-
propriate icon. The app will then announce the winner and keep track of each
players tallies. The players can play as many rounds as they wish.
******************************************************************************/
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlEc21BrIyBlo8HIH8z-jLpvnzPFASmFc",
  authDomain: "fsf-rps-multiplayer.firebaseapp.com",
  databaseURL: "https://fsf-rps-multiplayer.firebaseio.com",
  projectId: "fsf-rps-multiplayer",
  storageBucket: "fsf-rps-multiplayer.appspot.com",
  messagingSenderId: "874192548906",
  appId: "1:874192548906:web:4b32e77467f6ceaf0abf53"
};

class RPSGame {
  // PROPERTIES
  #db = null;
  #gameboard = null;
  #playerID = null;
  #opponentID = null;
  
  // METHODS
  /* *************************************************************
     Constructor Method
     - Create an object of type TriviaGame
     ************************************************************* */
  constructor(playerID) {
      this.#playerID = playerID;
  }
      
  /* *************************************************************
     Accessor Methods
     - Get object properties
     ************************************************************* */
  getGameDBRef() {
    return this.#db;
  }

  getGameBoard() {
    return this.#gameboard;
  }

  getPlayerID() {
    return this.#playerID;
  }

  getOpponentID() {
    return this.#opponentID;
  }

  /* *************************************************************
     Setter Methods
     - Set object properties.
     ************************************************************* */   
  setGameBoard() {
    var gameboard = this.#db.ref(),
        playerID = this.#playerID;
    
    // DEBUG:
    console.log(`Gameboard: ${gameboard}`);

    var player1 = gameboard.orderByChild('player1').equalTo(playerID),
        player2 = null,
        exists = false;

    // Check if this player's ID is in the database.
    player1.once('value')
      .then(function(snapshot) {
        var p1ChildNode = snapshot.exists();

        // DEBUG:
        console.log(`Player 1 child node exists? ${p1ChildNode}`);

        // If this player's ID is found in the `player1.id` field, 
        // set the data reference accordingly and return.
        if (p1ChildNode) {
          exists = true;
          gameboard = player1;
          return;
        }
        else {
          player2 = gameboard.orderByChild('player2').equalTo(playerID);

          player2.once('value')
            .then(function(snapshot) {
              var p2ChildNode = snapshot.exists();

              // DEBUG:
              console.log(`Player 2 child node exists? ${p2ChildNode}`);

              // If this player's ID is found in the `player2.id` field,
              // set the data reference accordingly.
              if(p2ChildNode) {
                gameboard = player2;
              }

              exists = p2ChildNode;
          });
        }
      });

    // If we didn't find the player in the database, create a new
    // gameboard object.
    if (!exists) {
      gameboard.push({
        player1ID: this.#playerID,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
    }

    this.#gameboard = gameboard;
  }

  /* *************************************************************
     initDB()
     - Initialize game database and return reference.
     ************************************************************* */   
  initDB(config) {
    firebase.initializeApp(config);

    this.#db = firebase.database();
  }
}

// Execute script once page is fully loaded.
$(document).ready(function() {
  // Create player ID
  var now = new Date(),
      id = `p${now.getTime()}-${Math.floor(Math.random() * 100000)}`;
  
  // Create new RPS game object.
  let game = new RPSGame(id);

  // Initiate the RPS game database and set the game object in the database.
  game.initDB(firebaseConfig);
  game.setGameBoard();

  // Get the reference to the appropriate game object in the database.
  var gameboard = game.getGameBoard();

  // DEBUG:
  console.log("db: " + gameboard);

  // Display player ID.
  $('#playerID').text(game.getPlayerID());

  // Listen for player's choice
  $('img').on('click', function(event) {
    var choice = event.target.id;

    // DEBUG:
    console.log(choice);
  });

  // Listen for the most recent child.
  gameboard.orderByChild('timestamp').limitToLast(1).on('child_added', function(snapshot) {
    console.log(snapshot.key);
  }, function(err) {
    console.log(`Error Code: ${err.code}`);
  });

});