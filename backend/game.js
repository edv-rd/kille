const postChatMessage = require("./utils");
const { rooms } = require("./sharedState"); // Import the shared state

const handleAction = async (io, socket, data, gameDeck) => {
  let resolvedGameObject = data.gameObject;
  const turn = resolvedGameObject.turn;
  const players = resolvedGameObject.players; 


  const player = players[turn];
  let nextPlayer = players[turn + 1];


  // Track card ownership history to handle "husu" case
  const cardHistory = new Map(players.map(player => [player.id, []]));

  const resolveSwitch = async (modifier) => {

    let currentTurn = resolvedGameObject.turn + modifier;

    if (currentTurn+1 >= players.length) {
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
      let nextPlayer = players[currentTurn+1];
      if (!nextPlayer || !nextPlayer.card) {
        console.log(`Next player or card is undefined at turn ${currentTurn}`);
      } else {
        const resolve = await resolveCard(nextPlayer.card.name, false, player, nextPlayer);
        postChatMessage(
          io,
          data,
          resolve
            ? `${player.name} byter med ${nextPlayer.name}. ${resolve}!`
            : `${player.name} byter med ${nextPlayer.name}`
        );

        
  
        if (resolve === "kavall förbi" || resolve === "värdshus förbi") {
          // Skip to the next player
          return resolveSwitch(resolvedGameObject, 2);
        }
  
        // Swap cards between player and nextPlayer
        let temp_card = player.card;
        player.card = nextPlayer.card;
        nextPlayer.card = temp_card;
  
        // Update card history
        cardHistory.get(player.id).push(temp_card);
        cardHistory.get(nextPlayer.id).push(player.card);

        resolvedGameObject.players[currentTurn].card = player.card
        resolvedGameObject.players[currentTurn+1].card = nextPlayer.card
  
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
        // FIXA
        io.in(data.room).emit("set_unalive", socket.id);
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

  const resolveWinner = async (io, data, gameObject) => {
    let resolvedGameObject = gameObject;

    const winningPlayers = gameObject.players.filter(player => player.alive);
    winningPlayers.sort((a, b) => b.card.value - a.card.value);
    postChatMessage(io, data, `${winningPlayers[0].name} vinner med ${winningPlayers[0].card.name}!`);

    resolvedGameObject.state = "end";
    io.in(data.room).emit("recieve_game", gameObject);
  };


  switch (data.action) {
    case "hold":
      postChatMessage(io, data, `${socket.name} knackar och håller`);
      if (resolvedGameObject.turn+1 >= resolvedGameObject.players.length) {
        await resolveWinner(io, data, resolvedGameObject);
      }
      io.in(data.room).emit("recieve_game", resolvedGameObject);
      return resolvedGameObject;

    case "change":
      await resolveSwitch(0);
      io.in(data.room).emit("recieve_game", resolvedGameObject);
      return resolvedGameObject;
  }

  if (!nextPlayer) {
    await resolveWinner(io, data);
  } 
};

module.exports = handleAction;
