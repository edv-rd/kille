const dealer = require("./dealer");

const express = require("express");
const app = express();
const port = 3000;
const socketPort = 3001;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

let deckStruct = require("./deck.json");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`någon connectade: ${socket.id}`);
  io.to(socket.id).emit("server_id", socket.id);

  socket.on("join_room", (data) => {
    console.log(`${socket.id} joinade ${data.room}`);
    socket.join(data.room);
    io.in(data.room).emit(
      "recieve_message",
      `${socket.id} joinade ${data.room}`
    );
  });

  socket.on("send_message", (data) => {
    console.log(`${socket.id} säger: ${data.message}`);
    io.in(data.room).emit(
      "recieve_message",
      `${socket.id} säger: ${data.message}`
    );
  });

  socket.on("change_state", (data) => {
    console.log(`${socket.id} försöker byta state till ${data.state}`);
    io.in(data.room).emit(
      "recieve_message",
      `${socket.id} försöker byta state till ${data.state}`
    );
    io.in(data.room).emit("recieve_state", data.state);
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
