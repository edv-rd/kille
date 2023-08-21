import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? "https://kille-backend.onrender.com:443" : "http://localhost:443";

const socket = io(URL, {
  transports: ["websocket"],
});

export default socket;
