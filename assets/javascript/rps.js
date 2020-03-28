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
    'rock-scissors': 'rock',
    'scissors-rock': 'rock',
    'scissors-paper': 'scissors',
    'paper-scissors': 'scissors',
    'paper-rock': 'paper',
    'rock-paper': 'paper'
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
  getGameDB() {
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
  setGameID(gameID) {
    this.#gameID = gameID;
  }

  setPlayerPos(playerPos) {
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

    return winner;
  }      
}

// Execute script once page is fully loaded.
$(document).ready(async () => {
  // Create player ID
  var now = new Date(),
      id = `p${now.getTime()}-${Math.floor(Math.random() * 1000000)}`;
  
  // Create new RPS game object.
  let game = new RPSGame(id);

  // Initiate the RPS game database.
  game.initDB(firebaseConfig);

  // Get the RPS game database for event listeners and such.
  var db = game.getGameDB(),
      gameRef,
      player1Choice,
      player2Choice;

  // Display player ID.
  $('#playerID').text(game.getPlayerID());

  // Listen for player's choice
  $('img').on('click', event => {
    event.preventDefault();

    var disabled = $('#rps-tokens').attr('disabled');

    // console.log(`disabled = ${disabled}`);
    
    if (disabled) {
      return;
    }
    else {
      $('#rps-tokens').attr({ disabled: true });

      var choice = event.target.id;

      game.addRound();
  
      // DEBUG:
      // console.log(choice);
      gameRef.update({
        rounds: game.getRoundNo()
      });

      gameRef.child(`player${game.getPlayerPos()}`).update({
        choice: choice
      });
    }
  });

  $('#username').on('change', () => {
    var username = $('#username').val();

    if (username && username.length > 0) {
      gameRef.child(`player${game.getPlayerPos()}`).update({
        username: username
      });
    }
  });

  await db.ref().orderByValue().limitToLast(1).once('child_added').then(snapshot => {
    var gameID = `game-${now.getTime()}-${Math.floor(Math.random() * 1000000)}`,
        playerID = game.getPlayerID(),
        playerPos = game.getPlayerPos();

    if (snapshot.child('waiting').val()) {
      // ASSERT: We have a game waiting for a second player.
      // DEBUG:
      console.log('We have a game waiting for a second player.');

      gameRef = snapshot.ref,
      gameID = snapshot.ref.key,
      playerPos = 2;

      snapshot.ref.update({
          [`player${playerPos}`]: { 
            id: playerID,
            username: `Player ${playerPos}`
          },
          waiting: false
      });        
    }
    else {
      // ASSERT: We don't have a game waiting for a second player.
      // DEBUG:
      console.log('We don\'t have a game waiting for a second player.');

      gameRef = game.getGameDB().ref(`${gameID}`);

      db.ref().update({
        [`${gameID}`]: {
          [`player${playerPos}`]: { 
            id: playerID,
            username: `Player ${playerPos}`
          },
          waiting: true,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      });
    }

    game.setGameID(gameID);
    game.setPlayerPos(playerPos);
  }, err => {
      console.log(`Error Code: ${err.code}`);
  }); 

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
  */

  db.ref(`${game.getGameID()}/player1/username`).on('value', snapshot => {
    var username = snapshot.val();
    
    if (username !== null)
      $('#player1-username').text(username).attr('style', 'color: #138580;');
  }, err => {
    console.log(`Error Code: ${err.code}`);
  });

  db.ref(`${game.getGameID()}/player2/username`).on('value', snapshot => {
    var username = snapshot.val();
    
    if (username !== null)
      $('#player2-username').text(username).attr('style', 'color: #D81E23');
  }), err => {
    console.log(`Error Code: ${err.code}`);
  };
  
  db.ref(`${game.getGameID()}/player1/choice`).on('value', snapshot => {
    if (snapshot.val()) {
      player1Choice = snapshot.val();
      
      // DEBUG
      console.log(`Player 1's choice: ${p1Choice}`);

      if (player2Choice) {
        gameRef.update({
          rounds: game.getRoundNo(),
          choices: { `round${game.getRoundNo()}` : { 
            player1: `${player1Choice}`,
            player2: `${player2Choice}`
          }
        }});
      }
    }
  }), err => {
    console.log(`Error Code: ${err.code}`);
  }

  db.ref(`${game.getGameID()}/player2/choice`).on('value', snapshot => {
    if (snapshot.val()) {
      player2Choice = snapshot.val();
      
      // DEBUG
      console.log(`Player 2's choice: ${p2Choice}`);

      if (player1Choice) {
        gameRef.update({
          rounds: game.getRoundNo(),
          choices: { `round${game.getRoundNo()}` : { 
            player1: `${player1Choice}`,
            player2: `${player2Choice}`
          }
        }});
      }
    }
  }), err => {
    console.log(`Error Code: ${err.code}`);
  }

  db.ref(`${game.getGameID()}/choices`).on('child_added', snapshot => {
    var winningChoice = game.determineRoundWinner(`${player1Choice}-${player2Choice}`),
    winner = "TIE";

    if (player1Choice === winningChoice) {
      // ASSERT: Player 1 won this round.
      winner = $('#player1-username').val();
    } else if (player2Choice === winningChoice) {
      // ASSERT: Playr 2 won this round.
      winner = $('#player2-username').val();
    }

    // DEBUG:
    console.log(`The winner of Round ${game.getRoundNo()} was ${winner}!`);
  }), err => {
    console.log(`Error Code: ${err.code}`);
  }
});