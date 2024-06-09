const express = require("express");
const app = express();
const port = 3000;
const socketPort = 443;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { rooms } = require("./sharedState"); // Import the shared state

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

let gameObject = {
  players: [],
  id: 0, 
  state: "lobby",
  turn: 0,
}

io.on("connection", (socket) => {
  // console.log(`någon connectade: ${socket.id}`);
  
  io.to(socket.id).emit("server_id", socket.id);
  io.to(socket.id).emit("recieve_id", socket.id);
  let alive = true;
  socket.alive = alive; // ?

  socket.on("join_room", async (data) => {
    socket.join(data.room);

    const players = await io.in(data.room).fetchSockets();

    playersArray = [];

    for (const player of players) {
      playersArray.push({ name: player.name, card: "", id: player.id, alive: true, winner: false });
    }

    gameObject.players = playersArray;
    gameObject.id = data.room.id;


    io.in(data.room).emit("recieve_game", gameObject);
    rooms[data.room] = { players: gameObject.players };

    postChatMessage(io, data, `${socket.name} joinade ${data.room}`);

    io.to(socket.id).emit("recieve_room", data.room);
  });

  socket.on("handle_action", async (data) => {
    const resolvedGameObject = await handleAction(io, socket, data, gameDeck);
    resolvedGameObject.turn++;
    io.in(data.room).emit("recieve_game", resolvedGameObject);
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
    postChatMessage(io, data, `${socket.name} försöker starta spelet`);

    gameObject.state = "game";
  
    gameDeck.reset();
    gameDeck.shuffle();
  
    gameObject.players.forEach((player) => {
      player.card = gameDeck.deal();
      // console.log(`Player (${player.name}) received card: ${player.card.name}`);
    })

    gameObject.turn = 0;
    io.to(gameObject.players[gameObject.turn]).emit("your_turn");
    io.in(data.room).emit("set_turn", gameObject.players[gameObject.turn].id);
    
    io.in(data.room).emit("recieve_game", gameObject);
  
    postChatMessage(io, data, `${gameObject.players[gameObject.turn].name} börjar!`);
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
