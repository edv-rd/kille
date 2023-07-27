import { useState, useEffect } from "react";
import socket from "./utils/socket.js";

const Game = ({ room }) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const sendChatMessage = () => {
    socket.emit("send_message", { message: chatMessage, room });
  };

  const handleOnChange = (event) => {
    setChatMessage(event.target.value);
  };

  useEffect(() => {
    socket.emit("join_room", { room });

    socket.on("recieve_message", (message) => {
      setChatMessages((oldArray) => [...oldArray, message]);
    });
  }, [socket]);

  return (
    <>
      <h1>kille online!</h1>
      <h2>spelar i game {room}</h2>
      <input
        type="text"
        onChange={handleOnChange}
        value={chatMessage}
        placeholder="chat"
      />

      <button onClick={sendChatMessage}>Send chat</button>
      {chatMessages.map((message) => {
        return <h2>{message}</h2>;
      })}
    </>
  );
};

export default Game;
