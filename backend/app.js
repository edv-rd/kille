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

const gameDeck = new Deck();

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

  socket.on("handle_action", async (data) => {
    const players = await io.in(data.room).fetchSockets();
    let turnOrder = Array.from(players);
    const timestamp = new Date();
    switch (data.action) {
      case "hold":
        io.in(data.room).emit(
          "recieve_message",
          `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
            socket.name
          } knackar och håller`
        );
        turn++;
        io.to(turnOrder[turn].id).emit("your_turn");
        break;
      case "change":
        //const nextPlayer = await io.in(turnOrder[turn + 1]).fetchSockets();
        const nextPlayer = turnOrder[turn + 1];

        //console.log(turnOrder[turn + 1])

        if (!nextPlayer) {
          io.in(data.room).emit(
            "recieve_message",
            `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
              socket.name
            } går i lek`
          );
          const new_card = gameDeck.deal();
          console.log(new_card);
          socket.card = new_card;
          io.to(socket.id).emit("recieve_card", new_card);
          break;
        } else {
          io.in(data.room).emit(
            "recieve_message",
            `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
              socket.name
            } byter med ${nextPlayer.name}`
          );
          let temp_card = socket.card;
          socket.card = nextPlayer.card;
          io.to(socket.id).emit("recieve_card", socket.card);

          nextPlayer.card = temp_card;
          io.to(nextPlayer.id).emit("recieve_card", nextPlayer.card);
          turn++;
          io.to(nextPlayer.id).emit("your_turn");
          break;
        }
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

    gameDeck.reset();
    gameDeck.shuffle();

    // const players = await io.sockets.adapter.rooms.get(data.room);
    const players = await io.in(data.room).fetchSockets();

    let turnOrder = Array.from(players);

    players.forEach((player) => {
      const card = gameDeck.deal();
      io.to(player.id).emit("recieve_card", card);
      player.card = card;

      io.in(data.room).emit(
        "recieve_message",
        `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
          player.name
        } får: ${player.card}`
      );
    });

    let turn = 0;

    io.to(turnOrder[turn].id).emit("your_turn");
    console.log(`det är ${turnOrder[turn].name}s tur!`);

    if (turn > turnOrder.length) {
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
