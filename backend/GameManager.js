// GameManager.js

class GameManager {
    constructor(roomId, deck) {
      this.roomId = roomId;
      this.deck = deck;
      this.players = [];
      this.state = "lobby";
      this.turn = 0;
    }
  
    addPlayer(player) {
      this.players.push(player);
    }
  
    resetDeck() {
      this.deck.reset();
      this.deck.shuffle();
    }
  
    dealCards() {
      this.players.forEach((player) => {
        player.card = this.deck.deal();
      });
    }
  
    getCurrentPlayer() {
      return this.players[this.turn];
    }
  
    nextTurn() {
      this.turn = (this.turn + 1) % this.players.length;
    }
  
    setGameState(state) {
      this.state = state;
    }
  
    getGameState() {
      return {
        players: this.players,
        state: this.state,
        turn: this.turn,
      };
    }
  }
  
  module.exports = GameManager;