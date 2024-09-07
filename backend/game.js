const postChatMessage = require("./utils");

const skipSwapCards = ["kuku", "kavall", "husar", "husu", "vardshus"];
const skipSwapCardsFromDeck = ["kavall", "husar", "husu", "vardshus"];

const handleAction = async (io, socket, data, gameManager) => {
  const player = gameManager.getCurrentPlayer();

  const nextPlayer = gameManager.getNextPlayer();
  switch (data.action) {
    case "hold":
      await handleHold(io, data, gameManager, player, nextPlayer);
      break;
    case "change":
      await handleChange(io, data, gameManager, player, nextPlayer);
      break;
    default:
      console.error("Unknown action:", data.action);
  }
};

const handleHold = async (io, data, gameManager, player, nextPlayer) => {
  postChatMessage(io, data, `${player.name} knackar och håller`);

  if (!nextPlayer) {
    await determineWinner(io, data, gameManager);
    return;
  } else {
    io.to(nextPlayer).emit("your_turn");
  }
};

const handleChange = async (io, data, gameManager, player, nextPlayer) => {
  if (!nextPlayer) {
    const card = gameManager.deck.deal();
    const resolve = await resolveCard(io, data, gameManager, card, true);

    if (!skipSwapCardsFromDeck.includes(card.name)) {
      gameManager.updatePlayerCard(player.id, card);
    }

    postChatMessage(
      io,
      data,
      resolve
        ? `${player.name} går i lek... och drar ${card.name}! ${resolve}!`
        : `${player.name} går i lek... och drar ${card.name}!`
    );
    await determineWinner(io, data, gameManager);
  } else {
    if (!nextPlayer || !nextPlayer.card) {
      console.log(`Next player or card is undefined at turn ${currentTurn}`);
    } else {
      const resolve = await resolveCard(
        io,
        data,
        gameManager,
        nextPlayer.card,
        false
      );

      postChatMessage(
        io,
        data,
        resolve
          ? `${player.name} byter med ${nextPlayer.name}. ${resolve}!`
          : `${player.name} byter med ${nextPlayer.name}`
      );

      // Check if resolve matches any of the skip swap cards
      if (!skipSwapCards.includes(nextPlayer.card.name)) {
        // Swap cards between player and nextPlayer
        let tempCard = player.card;
        player.card = nextPlayer.card;
        nextPlayer.card = tempCard;

        // Update card history in gameManager
        gameManager.updateCardHistory(player.id, tempCard);
        gameManager.updateCardHistory(nextPlayer.id, player.card);

        gameManager.updatePlayerCard(player.id, player.card);
        gameManager.updatePlayerCard(nextPlayer.id, nextPlayer.card);
      }
    }
  }
};

const resolveCard = async (io, data, gameManager, card, fromDeck) => {
  const player = gameManager.getCurrentPlayer();
  const nextPlayer = gameManager.getNextPlayer();
  const secondNextPlayer = gameManager.getNextPlayer(2);

  switch (card.name) {
    case "harlekin":
      if (!fromDeck) {
        console.log("setting harlekin to 0")
        card.value = 0;
      }
      break;
    case "kuku":
      postChatMessage(io, data, `kuku står!`);
      await determineWinner(io, data, gameManager);
      card.shown = true;
      return "kuku";
    case "husar":
      postChatMessage(io, data, `husar ger hugg!`);
      card.shown = true;

      player.alive = false;
      // Handle "husar" logic here
      return "husar";
    case "husu":
      postChatMessage(io, data, `svinhugg går igen!`);
      card.shown = true;

      if (nextPlayer) {
        const history = gameManager.getCardHistory(nextPlayer.id);

        if (history.length > 0) {
          const originalCard = history.shift();
          nextPlayer.card = originalCard;
        }
      }
      return "husu";
    case "kavall":
      if (fromDeck) return false;

      postChatMessage(io, data, `kavall förbi!`);
      card.shown = true;

      if (!secondNextPlayer) {
        await handleChange(io, data, gameManager, player, secondNextPlayer);
      }
      return "kavall";
    case "vardshus":
      if (fromDeck) return false;
      postChatMessage(io, data, `värdshus förbi!`);
      card.shown = true;

      if (!secondNextPlayer) {
        await handleChange(io, data, gameManager, player, secondNextPlayer);
      }
      return "vardshus";
    default:
      return false;
  }
};

const determineWinner = async (io, data, gameManager) => {
  const { players } = gameManager.getGameState();
  console.log(`innan filter: `);
  console.dir(players);
  const winningPlayers = players.filter((player) => player.alive);
  console.log(`innan sort: `);
  console.dir(winningPlayers);
  winningPlayers.sort((a, b) => b.card.value - a.card.value);
  console.log(`efter sort: `);
  console.dir(winningPlayers);

  
  players.forEach((p) => {
    p.card.shown = true;
  });

  postChatMessage(
    io,
    data,
    `${winningPlayers[0].name} vinner med ${winningPlayers[0].card.name}!`
  );

  gameManager.setGameState("end");
};

module.exports = handleAction;
