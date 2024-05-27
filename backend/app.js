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

    io.in(data.room).emit("update_players", playersArray);
    rooms[data.room] = { players: playersArray };

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
    postChatMessage(io, data, `${socket.name} försöker starta spelet`);
  
    io.in(data.room).emit("recieve_state", "game");
  
    gameDeck.reset();
    gameDeck.shuffle();
  
    const players = await io.in(data.room).fetchSockets();
  
 // Set player states and deal cards
 const cleanPlayersArray = players.map(player => ({
  name: player.name,
  id: player.id,
  alive: true,
  winner: false,
  card: gameDeck.deal()
}));

// Map socket IDs to cards
const playerCardsMap = cleanPlayersArray.reduce((acc, player) => {
  acc[player.id] = player.card;
  return acc;
}, {});

// Update each socket's card property
players.forEach(player => {
  player.card = playerCardsMap[player.id];
});

// Emit show_card event to each player
cleanPlayersArray.forEach(player => {
  io.to(player.id).emit("show_card", {
    card: player.card,
    id: player.id
  });
});
  
    rooms[data.room].players = cleanPlayersArray;
  
    turn = 0;
    io.in(data.room).emit("update_players", cleanPlayersArray);
  
    io.to(cleanPlayersArray[turn].id).emit("your_turn");
    io.in(data.room).emit("set_turn", cleanPlayersArray[turn].id);
  
    postChatMessage(io, data, `${cleanPlayersArray[turn].name} börjar!`);
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
