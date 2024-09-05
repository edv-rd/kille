const postChatMessage = require("./utils");

const handleAction = async (io, socket, data, gameManager) => {
  switch (data.action) {
    case "hold":
      await handleHold(io, socket, data, gameManager);
      break;
    case "change":
      await handleChange(io, socket, data, gameManager);
      break;
    default:
      console.error("Unknown action:", data.action);
  }
};

const handleHold = async (io, socket, data, gameManager) => {
  postChatMessage(io, data, `${socket.name} knackar och håller`);

  const nextPlayer = gameManager.getNextPlayer();

  if (!nextPlayer) {
    await determineWinner(io, data, gameManager);
    return;
  } else {
    io.to(nextPlayer).emit("your_turn");
  }
};

const handleChange = async (io, socket, data, gameManager) => {
  await resolveSwitch(io, data, gameManager);
};

const resolveSwitch = async (io, data, gameManager) => {
  const player = gameManager.getCurrentPlayer();

  const nextPlayer = gameManager.getNextPlayer();

  if (!nextPlayer) {
    const card = gameManager.deck.deal();
    gameManager.updatePlayerCard(player.id, card);
    const resolve = await resolveCard(io, data, gameManager, card);

    postChatMessage(
      io,
      data,
      resolve
        ? `${player.name} går i lek... och drar ${newCard.name}! ${resolve}!`
        : `${player.name} går i lek... och drar ${newCard.name}!`
    );
    await determineWinner(io, data, gameManager);
  } else {
    if (!nextPlayer || !nextPlayer.card) {
      console.log(`Next player or card is undefined at turn ${currentTurn}`);
    } else {
      const resolve = await resolveCard(io, data, gameManager, nextPlayer.card);

      postChatMessage(
        io,
        data,
        resolve
          ? `${player.name} byter med ${nextPlayer.name}. ${resolve}!`
          : `${player.name} byter med ${nextPlayer.name}`
      );

      if (resolve === "kavall förbi" || resolve === "värdshus förbi") {
        // Skip to the next player
        return resolveSwitch(io, data, gameManager);
      }

      // Swap cards between player and nextPlayer
      let tempCard = player.card;
      player.card = nextPlayer.card;
      nextPlayer.card = tempCard;

      // Update card history in gameManager
      gameManager.updateCardHistory(player.id, tempCard);
      gameManager.updateCardHistory(nextPlayer.id, player.card);

      gameManager.updatePlayerCard(player.id, player.card);
      gameManager.updatePlayerCard(nextPlayer.id + 1, nextPlayer.card);
    }
  }
};

const resolveCard = async (io, data, gameManager, card) => {
  const player = gameManager.getCurrentPlayer();
  const nextPlayer = gameManager.getNextPlayer();

  switch (card) {
    case "harlekin":
      if (!fromDeck) {
        card.value = 0;
      }
      break;
    case "kuku":
      postChatMessage(io, data, `kuku står!`);
      await determineWinner(io, data, gameManager);
      return false;
    case "husar":
      player.alive = false;
      // Handle "husar" logic here
      return "husar ger hugg";
    case "husu":
      if (nextPlayer) {
        postChatMessage(io, data, "svinhugg går igen");
        const history = gameManager.getCardHistory(nextPlayer.id);
        if (history.length > 0) {
          const originalCard = history.shift();
          nextPlayer.card = originalCard;
        }
      }
      return "svinhugg går igen";
    case "kavall":
      if (fromDeck) return false;
      return "kavall förbi";
    case "vardshus":
      if (fromDeck) return false;
      return "värdshus förbi";
    default:
      return false;
  }
};

const determineWinner = async (io, data, gameManager) => {
  const { players } = gameManager.getGameState();
  const winningPlayers = players.filter((player) => player.alive);
  winningPlayers.sort((a, b) => b.card.value - a.card.value);

  postChatMessage(
    io,
    data,
    `${winningPlayers[0].name} vinner med ${winningPlayers[0].card.name}!`
  );

  gameManager.setGameState("end");
};

module.exports = handleAction;
