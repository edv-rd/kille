const deckofcards = require("./cards");

class Deck {
    constructor() {
      this.deck = [];
      this.reset();
      this.shuffle();
    }
  
    reset() {
      this.deck = [];
      deckofcards.forEach((card) => {
        this.deck.push(card);
      });
    }
  
    shuffle() {
      let numberOfCards = this.deck.length;
      for (let i = 0; i < numberOfCards; i++) {
        let j = Math.floor(Math.random() * numberOfCards);
        let tmp = this.deck[i];
        this.deck[i] = this.deck[j];
        this.deck[j] = tmp;
      }
    }
  
    deal() {
      return this.deck.pop();
    }
  }

  module.exports = Deck;