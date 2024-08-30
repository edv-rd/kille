const express = require("express");
const app = express();
const port = 3000;
const socketPort = 443;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { rooms } = require("./sharedState"); // Import the shared state

const Deck = require("./Deck");
const GameManager = require("./GameManager");

const handleAction = require("./game");
const postChatMessage = require("./utils");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://kille-frontend.onrender.com/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log(`någon connectade: ${socket.id}`);
  io.to(socket.id).emit("server_id", socket.id);
  io.to(socket.id).emit("recieve_id", socket.id);

  socket.on("join_room", async (data) => {
    socket.join(data.room);
    const room = data.room;

    if (!rooms[room]) {
      const deck = new Deck();
      rooms[room] = new GameManager(room, deck);
    }

    const gameManager = rooms[room];

    // Add player to the game
    gameManager.addPlayer({
      name: socket.name,
      card: "",
      id: socket.id,
      alive: true,
      winner: false,
    });

    io.in(room).emit("recieve_game", gameManager.getGameState());

    postChatMessage(io, data, `${socket.name} joinade ${room}`);
    io.to(socket.id).emit("recieve_room", room);
  });

  socket.on("handle_action", async (data) => {
    const gameManager = rooms[data.room];
    const resolvedGameObject = await handleAction(
      io,
      socket,
      data,
      gameManager.deck
    );
    gameManager.nextTurn();
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
    const gameManager = rooms[data.room];

    postChatMessage(io, data, `${socket.name} försöker starta spelet`);

    gameManager.setGameState("game");
    gameManager.resetDeck();
    gameManager.dealCards();

    io.to(gameManager.getCurrentPlayer().id).emit("your_turn");
    io.in(data.room).emit("set_turn", gameManager.getCurrentPlayer().id);
    io.in(data.room).emit("recieve_game", gameManager.getGameState());

    postChatMessage(io, data, `${gameManager.getCurrentPlayer().name} börjar!`);
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
