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

  updatePlayerCard(playerId, card) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.card = card;
    }
  }

  resetDeck() {
    this.deck.reset();
    this.deck.shuffle();
  }

  dealCards() {
    this.players.forEach((player) => {
      player.card = this.deck.deal();
      player.card.shown = false;
    });
  }

  getCurrentPlayer() {
    return this.players[this.turn];
  }

  getNextPlayer(modifier=1) {
    return this.players[this.turn + modifier] || false;
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

  resetGame() {
    this.turn = 0;
    this.state = "lobby"; // or "lobby" depending on the desired behavior
    this.resetDeck(); // Reset and shuffle the deck
    this.dealCards(); // Deal new cards to all players

    // Clear the card history for each player
    this.cardHistory.forEach((_, playerId) => {
      this.cardHistory.set(playerId, []);
    });

    // Update the frontend with the new game state
    this.updateFrontend();
  }

  updateFrontend() {
    const gameState = this.getGameState();

    this.io.in(this.roomId).emit("recieve_game", gameState);
  }
}

module.exports = GameManager;
