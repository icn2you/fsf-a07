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
  #rules = { 
    'rock&scissors': 'rock',
    'scissors&paper': 'scissors',
    'paper&rock': 'paper'
  };
  #db = null;
  #gameID = null;
  #round = 0;
  #playerID = null;
  #playerPos = 1;
  
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

  getGameID() {
    return this.#gameID;
  }

  getRoundNo() {
    return this.#round;
  }

  getPlayerID() {
    return this.#playerID;
  }

  getPlayerPos() {
    return this.#playerPos;
  }

  /* *************************************************************
     Incrementer Methods
     - Increment object properties
     ************************************************************* */   
  addRound() {
    this.#round++;
  }  

  /* *************************************************************
     Setter Methods
     - Set object properties.
     ************************************************************* */   
  setGameID() {
    var dataRef = this.#db.ref(),
        gameID = dataRef.push(),
        playerID = this.#playerID,
        playerPos = this.#playerPos,
        player1 = dataRef.child('player1');

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
                          id : playerID,
                          username : `Player ${playerPos}`
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

          gameID.set({
            [`player${playerPos}`]: { 
              id : playerID,
              username : `Player ${playerPos}`
            },
            timestamp: firebase.database.ServerValue.TIMESTAMP
          });
        }
      });

    this.#gameID = gameID;

    console.log("this.#gameID = " + this.#gameID);

    this.#playerPos = playerPos;
  }

  /* *************************************************************
     initDB()
     - Initialize game database and return reference.
     ************************************************************* */   
  initDB(config) {
    firebase.initializeApp(config);

    this.#db = firebase.database();
  }

  /* *************************************************************
     determineRoundWinner(choices)
     - Return round winner based on rules. If choices are the same,
       return 'draw'
     ************************************************************* */
  determineRoundWinner(choices) {
    var winner = this.#rules[`${choices}`];

    // DEBUG:
    console.log(`winner: ${winner}`);
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
  game.setGameID();

  // Get the reference to the appropriate game object in the database.
  var gameID = game.getGameID(),
      roundChoices;

  // DEBUG:
  console.log("gameID = " + gameID);

  // Display player ID.
  $('#playerID').text(game.getPlayerID());

  // Listen for player's choice
  $('img').on('click', function(event) {
    var choice = event.target.id;

    game.addRound();

    // DEBUG:
    // console.log(choice);

    gameID.child(`player${game.getPlayerPos()}/choices`).update({
      [`round${game.getRoundNo()}`]: choice
    })
    
  });

  $('#username-submit').on('click', function() {
    var username = $('#username').val();

    if (username && username.length > 0) {
      gameID.child(`player${game.getPlayerPos()}`).update({
        username : username
      });
    }
  });

  gameID.child('player1/username').on('value', function(snapshot) {
    var username = snapshot.val();
    
    if (username !== null)
      $('#player1-username').text(username).attr('style', 'color: #138580;');
  }, function(err) {
      console.log(`Error Code: ${err.code}`);
  });

  gameID.child('player2/username').on('value', function(snapshot) {
    var username = snapshot.val();
    
    if (username !== null)
      $('#player2-username').text(username).attr('style', 'color: #D81E23');
  }), function(err) {
      console.log(`Error Code: ${err.code}`);
  };
  
  gameID.child('player1/choices').on('child_added', function(snapshot) {
    var p1Choice = snapshot.val();
    // DEBUG
    console.log(`Player 1's choice: ${p1Choice}`);
    roundChoices = p1Choice;

  }), function(err) {
      console.log(`Error Code: ${err.code}`);
  }

  gameID.child('player2/choices').on('child_added', function(snapshot) {
    var p2Choice = snapshot.val(),
        winner;
    // DEBUG
    console.log(`Player 1's choice: ${p1Choice}`);
    roundChoices += `&${p2Choice}`;

    winner = game.determineRoundWinner();

  }), function(err) {
      console.log(`Error Code: ${err.code}`);
  }
});