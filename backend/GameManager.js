// GameManager.js

class GameManager {
  constructor(roomId, deck, io) {
    this.roomId = roomId;
    this.deck = deck;
    this.players = [];
    this.state = "lobby";
    this.turn = 0;
    this.cardHistory = new Map();
    this.io = io;
  }

  addPlayer(player) {
    this.players.push(player);
    this.cardHistory.set(player.id, []);
  }

  updateCardHistory(playerId, card) {
    if (this.cardHistory.has(playerId)) {
      this.cardHistory.get(playerId).push(card);
    }
  }

  getCardHistory(playerId) {
    return this.cardHistory.get(playerId) || [];
  }

  updatePlayerCard(playerIndex, card) {
    if (this.players[playerIndex]) {
      this.players[playerIndex].card = card;
    }
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

  getNextPlayer() {
    return this.players[this.turn + 1] || false;
  }

  nextTurn() {

    this.turn = this.turn + 1 || false;
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

  updateFrontend() {
    const gameState = this.getGameState();
    this.io.in(this.roomId).emit("recieve_game", gameState);
  }
}

module.exports = GameManager;
