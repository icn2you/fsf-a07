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
const instr = `<p>You know the drill! Click one of the icons above to play a round. Your opponent will do the same.</p> 
<ul>
  <li>Rock crushes Scissors.</li>
  <li>Paper covers Rock.</li>
  <li>Scissors cuts Paper.</li>
</ul>
<p>Play as many rounds as you wish. Do not reload the page; otherwise you will end your game. Enjoy!</p>`;

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
  #rules = { 
    'rock-scissors': 'rock',
    'scissors-rock': 'rock',
    'scissors-paper': 'scissors',
    'paper-scissors': 'scissors',
    'paper-rock': 'paper',
    'rock-paper': 'paper'
  };
  #instr = '';
  #gameID = null;
  #round = 0;
  #playerID = null;
  #playerPos = 1;
  #wins = 0;
  #losses = 0;
  
  // METHODS
  /* *************************************************************
     Constructor Method
     - Create an object of type TriviaGame
     ************************************************************* */
  constructor(instructions, playerID) {
      this.#instr = instructions;
      this.#playerID = playerID;
  }
      
  /* *************************************************************
     Accessor Methods
     - Get object properties
     ************************************************************* */
  getGameDB() {
    return this.#db;
  }

  getInstr() {
    return this.#instr;
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

  getPlayerWins() {
    return this.#wins;
  }

  getPlayerLosses() {
    return this.#losses;
  }

  /* *************************************************************
     Incrementer Methods
     - Increment object properties
     ************************************************************* */   
  addRound() {
    this.#round++;
  }
  
  addWin() {
    this.#wins++;
  }

  addLoss() {
    this.#losses++;
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

    return winner;
  }      
}

// Execute script once page is fully loaded.
$(document).ready(async () => {
  // Create player ID
  var now = new Date(),
      id = `p${now.getTime()}-${Math.floor(Math.random() * 1000000)}`;
  
  // Create new RPS game object.
  let game = new RPSGame(instr, id);

  // Initiate the RPS game database.
  game.initDB(firebaseConfig);

  // Get the RPS game database for event listeners and such.
  var db = game.getGameDB(),
      gameRef,
      player1Choice,
      player2Choice;

  // Display player ID.
  $('#playerID').text(game.getPlayerID());
  $('#game-instructions').append(game.getInstr());

  // Listen for player's choice.
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

  // Listen for changes to username.
  $('#username').on('change', () => {
    var username = $('#username').val();

    $('#username').attr({ disabled: true }).attr({ placeholder: '' }).addClass('text-muted');

    if (username && username.length > 0) {
      gameRef.child(`player${game.getPlayerPos()}`).update({
        username: username
      });
    }
  });

  // Select the last game added to the database to determine if a player is waiting
  // for an opponent. If so, join that game; otherwise, create a new game.
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
            username: `Player ${playerPos}`,
            wins: 0,
            losses: 0
          },
          waiting: false
      });
      
      $('#system-msg').text('You have an opponent!');
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
            username: `Player ${playerPos}`,
            wins: 0,
            losses: 0
          },
          waiting: true,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }
      });

      $('#system-msg').addClass('waiting').text('Awaiting an opponent ');
    }

    game.setGameID(gameID);
    game.setPlayerPos(playerPos);
  }, err => {
      console.log(`Error Code: ${err.code}`);
  });

  // Listen for waiting to end.
  db.ref(`${game.getGameID()}/waiting`).on('value', snapshot => {
    var stillWaiting = snapshot.val();

    if (!stillWaiting)
      $('#system-msg').removeClass('waiting').text('Someone go!');
  });

  // Listen for changes to Player 1's username.
  db.ref(`${game.getGameID()}/player1/username`).on('value', snapshot => {
    var username = snapshot.val();
    
    if (username !== null)
      $('#player1-username').text(username).attr('style', 'color: #138580;');
  }, err => {
    console.log(`Error Code: ${err.code}`);
  });

  // Listen for changes to Player 2's username.
  db.ref(`${game.getGameID()}/player2/username`).on('value', snapshot => {
    var username = snapshot.val();
    
    if (username !== null)
      $('#player2-username').text(username).attr('style', 'color: #D81E23');
  }), err => {
    console.log(`Error Code: ${err.code}`);
  };

  // Listen for changes to Player 1's wins.
  db.ref(`${game.getGameID()}/player1/wins`).on('value', snapshot => {
    var wins = snapshot.val();
    
    if (wins !== null)
      $('#player1-wins').text(wins).attr('style', 'color: #138580;');
  }, err => {
    console.log(`Error Code: ${err.code}`);
  });  

  // Listen for changes to Player 1's losses.
  db.ref(`${game.getGameID()}/player1/losses`).on('value', snapshot => {
    var losses = snapshot.val();
    
    if (losses !== null)
      $('#player1-losses').text(losses).attr('style', 'color: #138580;');
  }, err => {
    console.log(`Error Code: ${err.code}`);
  });  

  // Listen for changes to Player 1's round choice.
  db.ref(`${game.getGameID()}/player1/choice`).on('value', snapshot => {
    if (snapshot.val()) {
      player1Choice = snapshot.val();

      var rounds = game.getRoundNo();
      
      // DEBUG
      console.log(`Player 1's choice: ${player1Choice}`);

      if (player2Choice) {
        gameRef.update({
          rounds: rounds,
          choices: { [`round${rounds}`]: { 
            player1: player1Choice,
            player2: player2Choice
          }
        }});

        $('#system-msg').removeClass('waiting');
      } 
      else {
        var slowPers = $("#player2-username").text();

        $('#system-msg').text(`Awaiting ${slowPers}\'s selection `).addClass('waiting');
      }
    }
  }), err => {
    console.log(`Error Code: ${err.code}`);
  }

  // Listen for changes to Player 2's wins.
  db.ref(`${game.getGameID()}/player2/wins`).on('value', snapshot => {
    var wins = snapshot.val();
    
    if (wins !== null)
      $('#player2-wins').text(wins).attr('style', 'color: #D81E23;');
  }, err => {
    console.log(`Error Code: ${err.code}`);
  });  

  // Listen for changes to Player 2's losses.
  db.ref(`${game.getGameID()}/player2/losses`).on('value', snapshot => {
    var losses = snapshot.val();
    
    if (losses !== null)
      $('#player2-losses').text(losses).attr('style', 'color: #D81E23;');
  }, err => {
    console.log(`Error Code: ${err.code}`);
  });

  // Listen for changes to Player 2's round choice.
  db.ref(`${game.getGameID()}/player2/choice`).on('value', snapshot => {
    if (snapshot.val()) {
      player2Choice = snapshot.val();

      var rounds = game.getRoundNo();      
      
      // DEBUG
      console.log(`Player 2's choice: ${player2Choice}`);

      if (player1Choice) {
        gameRef.update({
          rounds: rounds,
          choices: { [`round${rounds}`]: { 
            player1: player1Choice,
            player2: player2Choice
          }
        }});

        $('#system-msg').removeClass('waiting');
      }
      else {
        var slowPers = $("#player1-username").text();

        $('#system-msg').text(`Awaiting ${slowPers}\'s selection `).addClass('waiting');
      }
    }
  }), err => {
    console.log(`Error Code: ${err.code}`);
  }

  // Listen for the end of a game round.
  db.ref(`${game.getGameID()}/choices`).on('child_added', snapshot => {
    var winningChoice = 
      game.determineRoundWinner(`${player1Choice}-${player2Choice}`),
        player = game.getPlayerPos(),
        winner = "TIE",
        color = '#DA9B1F';

    if (player1Choice === winningChoice) {
      // ASSERT: Player 1 won this round.
      // Display the winner with appropriate styling.
      winner = $('#player1-username').text();
      color = '#138580';

      // If this player is the winner, increment wins; 
      // otherwise, increment losses.
      if (player === 1) {
        game.addWin();
      }
      else {
        game.addLoss();
      }
    } else if (player2Choice === winningChoice) {
      // ASSERT: Player 2 won this round.
      // Display the winner with appropriate styling.
      winner = $('#player2-username').text();
      color = '#D81E23';

      // If this player is the winner, increment wins;
      // otherwise, increment losses.
      if (player === 2) {
        game.addWin();
      }
      else {
        game.addLoss();
      }      
    }

    // Update this player's stats in the database.
    gameRef.child(`player${player}`).update({
      wins: game.getPlayerWins(),
      losses: game.getPlayerLosses()
    });    

    // DEBUG:
    console.log(`The winner of Round ${game.getRoundNo()} was ${winner}!`);

    $('label[for="round-winner"]').text(`Round ${game.getRoundNo()} Winner`);
    $('#round-winner').text(winner).attr('style', `color: ${color};`);
    
    if (winner !== 'TIE') {
      $('#system-msg').text(`CONGRATS, ${winner}!`);
    }
    else {
      $('#system-msg').text(`You tied.`);
    }

    // Reset player choices and re-enable game tokens.
    gameRef.child(`player${player}`).update({
      choice: null
    });

    player1Choice = null;
    player2Choice = null;
    $('#rps-tokens').attr({ disabled: false });

  }), err => {
    console.log(`Error Code: ${err.code}`);
  }
});