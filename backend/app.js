const dealer = require("./dealer");

const express = require("express");
const app = express();
const port = 3000;
const socketPort = 3001;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
  },
});

let turn = 0;
let turnOrder = [];


class Deck {
  constructor() {
    this.deck = [];
    this.reset();
    this.shuffle();
  }

  reset() {
    this.deck = [];
    const cards = [
      "harlekin",
      "harlekin",
      "kuku",
      "kuku",
      "husar",
      "husar",
      "husu",
      "husu",
      "kavall",
      "kavall",
      "vardshus",
      "vardshus",
      "12",
      "12",
      "11",
      "11",
      "10",
      "10",
      "9",
      "9",
      "8",
      "8",
      "7",
      "7",
      "6",
      "6",
      "5",
      "5",
      "4",
      "4",
      "3",
      "3",
      "2",
      "2",
      "1",
      "1",
      "krans",
      "krans",
      "blompotta",
      "blompotta",
      "blaren",
      "blaren",
    ];
    cards.forEach((card) => {
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

io.on("connection", (socket) => {
  console.log(`någon connectade: ${socket.id}`);
  io.to(socket.id).emit("server_id", socket.id);

  socket.on("join_room", async (data) => {
    socket.join(data.room);
    const timestamp = new Date();
    console.log(`${socket.id} joinade ${data.room}`);

    const playerCount = io.sockets.adapter.rooms.get(data.room).size;

    const playerNames = [];

    const sockets = await io.in(data.room).fetchSockets();

    for (const socket of sockets) {
      playerNames.push(socket.name);
    }

    io.in(data.room).emit("update_players", playerCount, playerNames);

    io.in(data.room).emit(
      "recieve_message",
      `[${timestamp.getHours()}:${timestamp.getMinutes()}]: ${
        socket.name
      } joinade ${data.room}`
    );
    io.to(socket.id).emit("recieve_room", data.room);
  });

  socket.on("join_game", (data, room) => {});

  socket.on("handle_action", (data) => {
    console.log("handle_action", data);
    switch (data.action) {
      case "hold":
        turn++;
        io.to(turnOrder[turn]).emit("your_turn");
        break;
      case "change":
        console.log("change card");
        turn++;
        io.to(turnOrder[turn]).emit("your_turn");
        break;
    }
  });

  socket.on("send_message", (data) => {
    const timestamp = new Date();

    console.log(`${socket.name} säger: ${data.message}`);
    io.in(data.room).emit(
      "recieve_message",
      `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
        socket.name
      } säger: ${data.message}`
    );
  });

  socket.on("change_name", (data) => {
    console.log(`${socket.id} vill byta namn till ${data.name}`);
    socket.name = data.name;
    io.to(socket.id).emit("recieve_name", data.name);
  });

  socket.on("start_game", async (data) => {
    const timestamp = new Date();

    console.log(`${socket.id} försöker starta spelet`);
    io.in(data.room).emit(
      "recieve_message",
      `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
        socket.name
      } försöker starta spelet`
    );
    io.in(data.room).emit("recieve_state", "game");

    const gameDeck = new Deck();

    const players = await io.sockets.adapter.rooms.get(data.room);

    turnOrder = Array.from(players);

    players.forEach((player) => {
      const card = gameDeck.deal();
      io.to(player).emit("recieve_card", card);

      io.in(data.room).emit(
        "recieve_message",
        `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${player} får: ${card}`
      );
    });

    const end_game = turn > turnOrder.length;

    if (!end_game) {
      io.to(turnOrder[turn]).emit("your_turn");
      console.log(`det är ${turnOrder[turn]}s tur!`);
    } else {
      console.log("end_game");
      io.in(data.room).emit(
        "end_game",
        `[${timestamp.getHours()}:${timestamp.getMinutes()}] spelet slut`
        );
        turn = 0;
    }
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
