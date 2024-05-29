import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production" ? "https://kille-backend.onrender.com:443" : "http://localhost:443";

const socket = io(URL, {
  transports: ["websocket"],
});

export default socket;
