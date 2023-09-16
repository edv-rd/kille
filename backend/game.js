const postChatMessage = require("./utils");

const handleAction = async (io, socket, data, gameDeck, turn) => {
  const players = await io.in(data.room).fetchSockets();
  console.log(turn)
  let turnOrder = Array.from(players);
  let nextPlayer = turnOrder[turn + 1];

  switch (data.action) {
    case "hold":
      postChatMessage(io, data, `${socket.name} knackar och håller`);
      break;

    case "change":
      if (!nextPlayer) {
        postChatMessage(io, data, `${socket.name} går i lek`);

        const new_card = gameDeck.deal();
        console.log(new_card);
        socket.card = new_card;
        io.to(socket.id).emit("recieve_card", new_card);
      } else {
        postChatMessage(
          io,
          data,
          `${socket.name} byter med ${nextPlayer.name}`
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
    io.in(data.room).emit("recieve_state", "end");
    turn = 0;
    postChatMessage(io, data, `spelet är slut!`);
    console.log(`spelet e slut!`);
  } else {
    io.to(nextPlayer.id).emit("your_turn");
    console.log(`det är ${nextPlayer.name}s tur!`);
    postChatMessage(io, data, `det är ${nextPlayer.name}s tur!`);
  }
};

module.exports = handleAction;
