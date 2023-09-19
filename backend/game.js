const postChatMessage = require("./utils");

const handleAction = async (io, socket, data, gameDeck, turn) => {
  const players = await io.in(data.room).fetchSockets();
  playersArray = Array.from(players);

  let turnOrder = Array.from(players);
  let nextPlayer = turnOrder[turn + 1];

  const resolveCard = async (card, from_deck) => {
    switch (card) {
      case "harlekin":
        if (from_deck) {
          card.value = 0;
        }
        break;
      case "kuku":
        const winner = await resolveGame(io, data);
        io.in(data.room).emit("recieve_state", "end");
        turn = 0;
        postChatMessage(io, data, `kuku står! ${winner} vinner!`);
        return false;
      case "husar":
        socket.alive = false;
        io.in(data.room).emit("set_unalive", socket.id);
        return "husar ger hugg";
      case "husu":
        return "svinhugg går igen";
      case "kavall":
        return "kavall förbi";
      case "vardshus":
        return "värdshus förbi";
      default:
        return true;
    }
  };

  const resolveGame = async (io, data) => {
    playersArray.forEach((player) => {
      const { name, card, id } = player;

      io.in(data.room).emit("show_card", {
        name,
        card,
        id,
      });
    });



    playersArray.filter((player) => {player.alive == true;}).sort((a, b) => b.card.value - a.card.value);

    return playersArray[0].name;
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
    const winner = await resolveGame(io, data);
    io.in(data.room).emit("recieve_state", "end");
    turn = 0;
    postChatMessage(io, data, `spelet är slut. ${winner} vinner!`);
    //console.log(`spelet e slut!`);
  } else {
    io.to(nextPlayer.id).emit("your_turn");
    //console.log(`det är ${nextPlayer.name}s tur!`);
    postChatMessage(io, data, `det är ${nextPlayer.name}s tur!`);
    io.in(data.room).emit("set_turn", nextPlayer.id);
  }
};

module.exports = handleAction;
