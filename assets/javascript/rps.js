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
    'scissors-paper': 'scissors',
    'paper-rock': 'paper'
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
  }      
}

// Execute script once page is fully loaded.
$(document).ready(function() {
  // Create player ID
  var now = new Date(),
      id = `p${now.getTime()}-${Math.floor(Math.random() * 100000)}`;
  
  // Create new RPS game object.
  let game = new RPSGame(id);

  // Initiate the RPS game database.
  game.initDB(firebaseConfig);

  // Get the reference to the appropriate game object in the database.
  var db = game.getGameDB();
  var dbRef = game.getGameDB().ref(),
      // Get temporary game reference to prevent .on('value') events
      // from throwing a TypeError
      gameID = dbRef.push(),
      roundChoices;

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
        username: username
      });
    }
  });

  dbRef.orderByValue().limitToLast(1).once('child_added').then(snapshot => {
    // DEBUG:
    // console.log(snapshot.ref.toString());
    console.log(`initial gameID =  ${gameID}`);

    var tempGameID = `game-${now.getTime()}-${Math.floor(Math.random() * 1000000)}`,
        playerID = game.getPlayerID(),
        playerPos = game.getPlayerPos();

    if (snapshot.child('waiting').val()) {
      // ASSERT: We have a game waiting for a second player.
      // DEBUG:
      console.log('ASSERT: We have a game waiting for a second player.');

      gameID = snapshot.ref,
      playerPos = 2;
      
      // DEBUG:
      // console.log(`gameID = ${gameID}`);

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

      gameID = game.getGameDB().ref(`${tempGameID}`);

      dbRef.update({
        [`${tempGameID}`]: {
          [`player${playerPos}`]: { 
            id: playerID,
            username: `Player ${playerPos}`
          },
          waiting: true,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      });
    }

    game.setGameID(tempGameID);
    game.setPlayerPos(2);

    // DEBUG:
    // console.log(`this.#gameID = ${game.getGameID()}`);
    console.log(`set gameID =  ${gameID}`);

  }, function(err) {
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