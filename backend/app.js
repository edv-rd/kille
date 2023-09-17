const express = require("express");
const app = express();
const port = 3000;
const socketPort = 443;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const handleAction = require("./game");
const postChatMessage = require("./utils");
const deckofcards = require("./cards");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://kille-frontend.onrender.com/",
    methods: ["GET", "POST"],
  },
});

let turn = 0;

class Deck {
  constructor() {
    this.deck = [];
    this.reset();
    this.shuffle();
  }

  reset() {
    this.deck = [];
    deckofcards.forEach((card) => {
      this.deck.push(card);
    });
  }

  shuffle() {
    let numberOfCards = this.deck.length;
    for (let i = 0; i < numberOfCards; i++) {
      let j = Math.floor(Math.random() * numberOfCards);
      let tmp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = tmp;
    }
  }

  deal() {
    return this.deck.pop();
  }
}

const gameDeck = new Deck();

io.on("connection", (socket) => {
  // console.log(`någon connectade: ${socket.id}`);
  io.to(socket.id).emit("server_id", socket.id);

  socket.on("join_room", async (data) => {
    socket.join(data.room);

    const players = await io.in(data.room).fetchSockets();

    playersArray = [];

    for (const player of players) {
      playersArray.push({ name: player.name, card: "", id: player.id });
    }

    io.in(data.room).emit("update_players", playersArray);

    postChatMessage(io, data, `${socket.name} joinade ${data.room}`);

    io.to(socket.id).emit("recieve_room", data.room);
  });

  socket.on("handle_action", async (data) => {
    await handleAction(io, socket, data, gameDeck, turn);
    turn++;
  });

  socket.on("send_message", (data) => {
    // console.log(`${socket.name} säger: ${data.message}`);

    postChatMessage(io, data, `${socket.name} säger: ${data.message}`);
  });

  socket.on("change_name", (data) => {
    // console.log(`${socket.id} vill byta namn till ${data.name}`);
    socket.name = data.name;
    io.to(socket.id).emit("recieve_name", data.name);
  });

  socket.on("start_game", async (data) => {
    // console.log(`${socket.id} försöker starta spelet`);

    postChatMessage(io, data, `${socket.name} försöker starta spelet`);

    io.in(data.room).emit("recieve_state", "game");

    gameDeck.reset();
    gameDeck.shuffle();

    // const players = await io.sockets.adapter.rooms.get(data.room);
    const players = await io.in(data.room).fetchSockets();

    let turnOrder = Array.from(players);

    players.forEach((player) => {
      const card = gameDeck.deal();
      player.card = card;
      io.to(player.id).emit("show_card", {
        name: player.name,
        card: player.card,
        id: player.id,
      });
    });

    turn = 0;

    io.to(turnOrder[turn].id).emit("your_turn");
    io.in(data.room).emit("set_turn", turnOrder[turn].id);

    // console.log(`${turnOrder[turn].name} börjar!`);
    postChatMessage(io, data, `${turnOrder[turn].name} börjar!`);
  });
});

app.get("/", (req, res) => {
  res.send("kille!");
});

app.listen(port, () => {
  console.log(`kille server igång på ${port}`);
});

server.listen(socketPort, () => {
  console.log(`kille socket server igång på ${socketPort}`);
});
