let deckStruct = require("./deck.json");

function dealCard() {}

function showDeck() {
  let cardsArray = [];

  deckStruct.forEach((card) => {
    cardsArray.push(card.name);
  });

  return cardsArray;
}

function shuffleDeck() {}
