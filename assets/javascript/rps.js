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
  #icons = [];
  #players = [
    { name: null, wins: 0, losses: 0 },
    { name: null, wins: 0, losses: 0 }
  ];
  
  // METHODS
  /* *************************************************************
     Constructor Method
     - Create an object of type TriviaGame
     ************************************************************* */
  constructor(rpsIcons, p1, p2) {
      // this.#db = initDB(dbConfig);
  }
      
  /* *************************************************************
     Accessor Methods
     - Get object properties
     ************************************************************* */
  getGameDataRef() {
    return this.#db;
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
  // Create new RPS game object.
  let game = new RPSGame([], "", "");

  game.initDB(firebaseConfig);

  var gameDB = game.getGameDataRef();

  // DEBUG:
  console.log("db: " + gameDB);

  $('<img>').on('click', function(event) {

  });

  gameDB.ref().on('child_added', function(childState) {

  }, function(err) {

  });

});