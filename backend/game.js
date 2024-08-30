const postChatMessage = require("./utils");
const { rooms } = require("./sharedState"); // Import the shared state

const handleAction = async (io, socket, data, gameDeck) => {
  let gameState = data.gameObject;

  switch (data.action) {
    case "hold":
      await handleHold(io, socket, data, gameState);
      break;
    case "change":
      await handleChange(io, socket, data, gameState, gameDeck);
      break;
    default:
      console.error("Unknown action:", data.action);
  }

  io.in(data.room).emit("recieve_game", gameState);
};

const handleHold = async (io, socket, data, gameState) => {
  postChatMessage(io, data, `${socket.name} knackar och håller`);
  if (gameState.players[gameState.turn + 1]) {
    io.to(gameState.players[gameState.turn + 1]).emit("your_turn", gameState);
  } else {
    await determineWinner(io, data, gameState);
  }
};

const handleChange = async (io, socket, data, gameState, gameDeck) => {
  await resolveSwitch(io, data, gameState, 0, gameDeck);
};

const resolveSwitch = async (modifier) => {
  let currentTurn = resolvedGameObject.turn + modifier;

  if (currentTurn + 1 >= players.length) {
    const new_card = gameDeck.deal();
    const resolve = await resolveCard(new_card.name, true, player);
    player.card = new_card;
    postChatMessage(
      io,
      data,
      resolve
        ? `${player.name} går i lek... och drar ${new_card.name}!`
        : `${player.name} går i lek... och drar ${new_card.name}!`
    );

    await resolveWinner(io, data, resolvedGameObject);
  } else {
    let nextPlayer = players[currentTurn + 1];
    if (!nextPlayer || !nextPlayer.card) {
      console.log(`Next player or card is undefined at turn ${currentTurn}`);
    } else {
      const resolve = await resolveCard(
        nextPlayer.card.name,
        false,
        player,
        nextPlayer
      );

      postChatMessage(
        io,
        data,
        resolve
          ? `${player.name} byter med ${nextPlayer.name}. ${resolve}!`
          : `${player.name} byter med ${nextPlayer.name}`
      );

      if (resolve === "kavall förbi" || resolve === "värdshus förbi") {
        // Skip to the next player
        return resolveSwitch(2);
      }

      // Swap cards between player and nextPlayer
      let temp_card = player.card;
      player.card = nextPlayer.card;
      nextPlayer.card = temp_card;

      // Update card history
      cardHistory.get(player.id).push(temp_card);
      cardHistory.get(nextPlayer.id).push(player.card);

      resolvedGameObject.players[currentTurn].card = player.card;
      resolvedGameObject.players[currentTurn + 1].card = nextPlayer.card;

      return resolvedGameObject;
    }
  }
};

const resolveCard = async (card, from_deck, player, nextPlayer) => {
  switch (card) {
    case "harlekin":
      if (!from_deck) {
        card.value = 0;
      }
      break;
    case "kuku":
      postChatMessage(io, data, `kuku står!`);
      await resolveWinner(io, data, resolvedGameObject);
      return false;
    case "husar":
      socket.alive = false;
      resolvedGameObject.players[turn].alive = false;
      // FIXA
      return "husar ger hugg";
    case "husu":
      if (nextPlayer) {
        postChatMessage(io, data, "svinhugg går igen");
        const history = cardHistory.get(nextPlayer.id);
        if (history.length > 0) {
          const originalCard = history.shift();
          nextPlayer.card = originalCard;
          io.in(data.room).emit("recieve_game", data);
        }
      }
      return "svinhugg går igen";
    case "kavall":
      if (from_deck) return false;
      return "kavall förbi";
    case "vardshus":
      if (from_deck) return false;
      return "värdshus förbi";
    default:
      return false;
  }
};

const determineWinner = async (io, data, gameObject) => {
  let gameState = gameObject;

  const winningPlayers = gameObject.players.filter((player) => player.alive);
  winningPlayers.sort((a, b) => b.card.value - a.card.value);
  postChatMessage(
    io,
    data,
    `${winningPlayers[0].name} vinner med ${winningPlayers[0].card.name}!`
  );

  gameState.state = "end";
  io.in(data.room).emit("recieve_game", gameState);
};

module.exports = handleAction;
