const postChatMessage = require("./utils");

const handleAction = async (io, socket, data, gameDeck, turn) => {
  const players = await io.in(data.room).fetchSockets();
  let turnOrder = Array.from(players);
  let nextPlayer = turnOrder[turn + 1];

  switch (data.action) {
    case "hold":
      postChatMessage(io, data, `${socket.name} knackar och håller`);
      break;

    case "change":
      if (!nextPlayer) {
        const new_card = gameDeck.deal();
        const resolve = resolveCard(new_card.name, true);
        socket.card = new_card;
        postChatMessage(
          io,
          data,
          resolve
            ? `${socket.name} går i lek. ${resolve}!`
            : `${socket.name} går i lek!`
        );
        io.to(socket.id).emit("recieve_card", new_card);
      } else {
        const resolve = resolveCard(nextPlayer.card.name, false);
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
        nextPlayer.card = temp_card;
        io.to(nextPlayer.id).emit("recieve_card", nextPlayer.card);
      }
      break;
  }

  if (!nextPlayer) {
    const winner = await resolveGame(io, data);
    io.in(data.room).emit("recieve_state", "end");
    turn = 0;
    postChatMessage(io, data, `spelet är slut. ${winner}!`);
    //console.log(`spelet e slut!`);
  } else {
    io.to(nextPlayer.id).emit("your_turn");
    //console.log(`det är ${nextPlayer.name}s tur!`);
    postChatMessage(io, data, `det är ${nextPlayer.name}s tur!`);
  }
};

const resolveCard = (card, from_deck) => {
  switch (card) {
    case "harlekin":
      break;
    case "kuku":
      return "kuku står";
    case "husar":
      return "husar ger hugg";
    case "husu":
      return "svinhugg går igen";
    case "kavall":
      return "kavall förbi";
    case "vardshus":
      return "värdshus förbi";
  }
};

const resolveGame = async (io, data) => {
  const players = await io.in(data.room).fetchSockets();
    playersArray = Array.from(players);

    playersArray.sort((a, b) => b.card.value - a.card.value);

    return playersArray[0].name;
    
};

module.exports = handleAction;
