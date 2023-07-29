import { useState, useEffect } from "react";
import socket from "./utils/socket.js";
import GameBoard from "./GameBoard.jsx";
import styled from "styled-components";

const Game = ({ room }) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [gameState, setGameState] = useState("lobby");

  const sendChatMessage = () => {
    socket.emit("send_message", { message: chatMessage, room });
    setChatMessage("");
  };

  const startGame = () => {
    socket.emit("change_state", { state: "game", room });
  };

  useEffect(() => {
    socket.emit("join_room", { room });

    socket.on("recieve_message", (message) => {
      setChatMessages((oldArray) => [...oldArray, message]);
    });

    socket.on("recieve_state", (state) => {
      setGameState(state);
    });
  }, [socket]);

  return (
    <>
      <h1>kille online!</h1>
      <h2>
        spelar i game {room}({gameState})
      </h2>

      {gameState == "game" ? (
        <GameBoard />
      ) : (
        <button onClick={startGame}>Start game</button>
      )}
      <input
        type="text"
        onChange={(event) => setChatMessage(event.target.value)}
        value={chatMessage}
        placeholder="chat"
      />

      <button onClick={sendChatMessage} disabled={!chatMessage.length}>
        Send chat
      </button>
      {chatMessages.map((message) => {
        return <p>{message}</p>;
      })}
    </>
  );
};

export default Game;
