const postChatMessage = require("./utils");
const { rooms } = require("./sharedState"); // Import the shared state



const handleAction = async (io, socket, data, gameDeck, turn) => {
  const players = rooms[data.room].players; 
  playersArray = Array.from(players);

  let turnOrder = Array.from(players);
  let nextPlayer = turnOrder[turn + 1];
  // console.log(`turnorder name: ${turnOrder[turn].name}`)
  // console.log(`turnorder +1 name: ${turnOrder[turn+1].name}`)
  // console.log(`1 nästa spelare: ${nextPlayer.name}`)

  const resolveCard = async (card, from_deck) => {
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
        return "svinhugg går igen";
      case "kavall":
        if (from_deck) return false;
        return "kavall förbi";
      case "vardshus":
        if (from_deck) return false;
        return "värdshus förbi";
      default:
        return true;
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

      // console.log(`forEach loop efter sortering: namn: ${name} kort: ${card.name} värt ${card.value} med id: ${id}`)
 
      io.in(data.room).emit("show_card", {
        name,
        card,
        id,
      });
    });



      
    // playersArray.forEach((p) => {console.log(`namn: ${p.name} kort: ${p.card.name} värt ${p.card.value} med id: ${p.id}`)})




    rooms[data.room] = { players: alivePlayers };


    // console.log(`${alivePlayers[0].name} vinner med ${alivePlayers[0].card.name} värt ${alivePlayers[0].card.value} och ${alivePlayers[0].isWinner ? "winner" : "false"}`)
    // console.log(`${alivePlayers[1].name} förlorar med ${alivePlayers[0].card.name} värt ${alivePlayers[0].card.value}`)



    return alivePlayers;
  };

  switch (data.action) {
    case "hold":
      postChatMessage(io, data, `${socket.name} knackar och håller`);
      break;

    case "change":
      if (!nextPlayer) {
        const new_card = gameDeck.deal();
        const resolve = await resolveCard(new_card.name, true);
        if (!resolve) {
          break;
        }
        socket.card = new_card;
        postChatMessage(
          io,
          data,
          resolve
            ? `${socket.name} går i lek. ${resolve}!`
            : `${socket.name} går i lek!`
        );
        io.to(socket.id).emit("recieve_card", new_card);
        io.in(data.room).emit("show_card", {
          card: socket.card,
          id: socket.id,
        });
      } else {
        const resolve = await resolveCard(nextPlayer.card.name, false);
        if (!resolve) {
          break;
        }
        postChatMessage(
          io,
          data,
          resolve
            ? `${socket.name} byter med ${nextPlayer.name}. ${resolve}!`
            : `${socket.name} byter med ${nextPlayer.name}`
        );

        let temp_card = socket.card;
        socket.card = nextPlayer.card;
        io.to(socket.id).emit("recieve_card", socket.card);
        io.to(socket.id).emit("show_card", {
          id: socket.id,
          card: socket.card,
        });

        nextPlayer.card = temp_card;
        io.to(nextPlayer.id).emit("recieve_card", nextPlayer.card);
        io.to(nextPlayer.id).emit("show_card", {
          id: nextPlayer.id,
          card: nextPlayer.card,
        });
      }
      break;
  }

  if (!nextPlayer) {
    const winners = await resolveGame(io, data);
    io.in(data.room).emit("set_winner", winners[0].id);
    io.in(data.room).emit("recieve_state", "end");
    turn = 0;
    //io.in(data.room).emit("update_players", winners);

    postChatMessage(io, data, `spelet är slut. ${winners[0].name} vinner!`);
    //console.log(`spelet e slut!`);
  } else {
    console.log(`nästa spelare: ${nextPlayer.name}`)
    io.to(nextPlayer.id).emit("your_turn");
    //console.log(`det är ${nextPlayer.name}s tur!`);
    postChatMessage(io, data, `det är ${nextPlayer.name}s tur!`);
    io.in(data.room).emit("set_turn", nextPlayer.id);
  }
};

module.exports = handleAction;
