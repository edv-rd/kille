const dealer = require("./dealer");

const express = require("express");
const app = express();
const port = 3000;
const socketPort = 443;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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
    const cards = [
      { name: "harlekin", value: 21 },
      { name: "harlekin", value: 21 },

      { name: "kuku", value: 20 },
      { name: "kuku", value: 20 },

      { name: "husar", value: 19 },
      { name: "husar", value: 19 },

      { name: "husu", value: 18 },
      { name: "husu", value: 18 },

      { name: "kavall", value: 17 },
      { name: "kavall", value: 17 },

      { name: "vardshus", value: 16 },
      { name: "vardshus", value: 16 },

      { name: "12", value: 15 },
      { name: "12", value: 15 },

      { name: "11", value: 14 },
      { name: "11", value: 14 },

      { name: "10", value: 13 },
      { name: "10", value: 13 },

      { name: "9", value: 12 },
      { name: "9", value: 12 },

      { name: "8", value: 11 },
      { name: "8", value: 11 },

      { name: "7", value: 10 },
      { name: "7", value: 10 },

      { name: "6", value: 9 },
      { name: "6", value: 9 },

      { name: "5", value: 8 },
      { name: "5", value: 8 },

      { name: "4", value: 7 },
      { name: "4", value: 7 },

      { name: "3", value: 6 },
      { name: "3", value: 6 },

      { name: "2", value: 5 },
      { name: "2", value: 5 },

      { name: "1", value: 4 },
      { name: "1", value: 4 },

      { name: "krans", value: 3 },
      { name: "krans", value: 3 },

      { name: "blompottan", value: 2 },
      { name: "blompottan", value: 2 },

      { name: "blaren", value: 1 },
      { name: "blaren", value: 1 },
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
        if (turn > turnOrder.length) {
          io.in(data.room).emit(
            "end_game",
            `[${timestamp.getHours()}:${timestamp.getMinutes()}] spelet slut`
          );
          console.log(`spelet e slut!`);
          break;
        }
        io.to(turnOrder[turn].id).emit("your_turn");
        console.log(`det är ${turnOrder[turn].name}s tur!`);

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

          if (turn > turnOrder.length) {
            io.in(data.room).emit(
              "end_game",
              `[${timestamp.getHours()}:${timestamp.getMinutes()}] spelet slut`
            );
            console.log(`spelet e slut!`);
            break;
          }
          turn++;
          io.to(nextPlayer.id).emit("your_turn");
          console.log(`det är ${nextPlayer.name}s tur!`);
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
      console.log(`${player.name} har fått ${player.card.name}`);

      io.in(data.room).emit(
        "recieve_message",
        `[${timestamp.getHours()}:${timestamp.getMinutes()}] ${
          player.name
        } får: ${player.card.name}`
      );
    });

    let turn = 0;

    io.to(turnOrder[turn].id).emit("your_turn");
    console.log(`det är ${turnOrder[turn].name}s tur!`);
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
