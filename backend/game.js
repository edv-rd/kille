const postChatMessage = require("./utils");
const { rooms } = require("./sharedState"); // Import the shared state

const handleAction = async (io, socket, data, gameDeck, turn) => {
  const players = rooms[data.room].players; 
  let playersArray = Array.from(players);

  let turnOrder = Array.from(players);
  let nextPlayer = turnOrder[turn + 1];

  // Track card ownership history to handle "husu" case
  const cardHistory = new Map(playersArray.map(player => [player.id, []]));

  const resolveSwitch = async (player, nextPlayer) => {
    if (!nextPlayer) {
      const new_card = gameDeck.deal();
      const resolve = await resolveCard(new_card.name, true, player);
      console.log(`${player.name} dragit nytt kort ${new_card.name}`)
      player.card = new_card;
      console.log(`${player.name} har nu ${player.card.name}`)
      postChatMessage(
        io,
        data,
        resolve
          ? `${player.name} går i lek... och drar ${new_card.name}!`
          : `${player.name} går i lek... och drar ${new_card.name}!`
      );
      io.to(player.id).emit("recieve_card", new_card);
      console.log(`emittar till alla i data.room show_card med card: ${player.card.name} och id ${player.id}`)

      io.in(data.room).emit("show_card", {
        card: player.card,
        id: player.id,
      });
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
        const newNextPlayer = turnOrder[turn + 2] || null;
        await resolveSwitch(player, newNextPlayer);
        return;
      }

      // Swap cards between player and nextPlayer
      let temp_card = player.card;
      // console.log(`${temp_card.name} blir`);
      // console.log( `från ${player.card.name}`); 
      player.card = nextPlayer.card;
      console.log(`${player.card.name} blir sammma som ${nextPlayer.card.name}`); 
      nextPlayer.card = temp_card;
      console.log(`${nextPlayer.card.name} blir från ${temp_card.name}`); 

      // Emit events to update both players with their new cards
      io.to(player.id).emit("recieve_card", player.card);
      io.to(nextPlayer.id).emit("recieve_card", nextPlayer.card);
      console.log(`emittar till alla i data.room show_card med card: ${player.card.name} och id ${player.id}`)

      // Emit events to show updated cards to the room
      io.in(data.room).emit("show_card", {
        id: player.id,
        card: player.card,
      });
      console.log(`emittar till alla i data.room show_card med card: ${nextPlayer.card.name} och id ${nextPlayer.id}`)

      io.in(data.room).emit("show_card", {
        id: nextPlayer.id,
        card: nextPlayer.card,
      });

      // Update card history
      cardHistory.get(player.id).push(temp_card);
      cardHistory.get(nextPlayer.id).push(player.card);
    }
  }

  const resolveCard = async (card, from_deck, player, nextPlayer) => {
    switch (card) {
      case "harlekin":
        if (!from_deck) {
          card.value = 0;
        }
        break;
      case "kuku":
        const winners = await resolveGame(io, data);
        io.in(data.room).emit("recieve_state", "end");
        turn = 0;
        postChatMessage(io, data, `kuku står! ${winners[0].name} vinner!`);
        return false;
      case "husar":
        socket.alive = false;
        io.in(data.room).emit("set_unalive", socket.id);
        return "husar ger hugg";
      case "husu":
        postChatMessage(io, data, "svinhugg går igen");
        if (nextPlayer) {
          const history = cardHistory.get(nextPlayer.id);
          if (history.length > 0) {
            const originalCard = history.shift();
            nextPlayer.card = originalCard;
            io.to(nextPlayer.id).emit("recieve_card", originalCard);
            io.to(nextPlayer.id).emit("show_card", {
              id: nextPlayer.id,
              card: originalCard,
            });
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

  const resolveGame = async (io, data) => {
    const players = rooms[data.room].players;

    // Filter alive players
    const alivePlayers = players.filter(player => player.alive);

    // Sort players by card value in descending order
    alivePlayers.sort((a, b) => b.card.value - a.card.value);

    alivePlayers.forEach((player) => {
      const { name, card, id } = player;

      io.in(data.room).emit("show_card", {
        name,
        card,
        id,
      });
    });

    rooms[data.room] = { players: alivePlayers };

    return alivePlayers;
  };

  switch (data.action) {
    case "hold":
      postChatMessage(io, data, `${socket.name} knackar och håller`);
      break;

    case "change":
      console.log(`${socket.name} (socket name), `); 
      console.dir(socket)
      // console.log(`har kortet ${socket.card}`);
      await resolveSwitch(socket, nextPlayer);
      break;
  }

  if (!nextPlayer) {
    const winners = await resolveGame(io, data);
    io.in(data.room).emit("set_winner", winners[0].id);
    io.in(data.room).emit("recieve_state", "end");
    turn = 0;
    postChatMessage(io, data, `spelet är slut. ${winners[0].name} vinner med ${winners[0].card.name}!`);
  } else {
    console.log(`nästa spelare: ${nextPlayer.name}`);
    io.to(nextPlayer.id).emit("your_turn");
    postChatMessage(io, data, `det är ${nextPlayer.name}s tur!`);
    io.in(data.room).emit("set_turn", nextPlayer.id);
  }
};

module.exports = handleAction;
