import { useState, useEffect } from "react";
import socket from "./utils/socket.js";
import GameBoard from "./GameBoard.jsx";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
`;

const StyledChatContainer = styled(StyledContainer)`
  width: 100%;
`;

const Game = ({ room, name }) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [gameState, setGameState] = useState("lobby");

  const sendChatMessage = () => {
    socket.emit("send_message", { message: chatMessage, room, name });
    setChatMessage("");
  };

  const startGame = () => {
    socket.emit("change_state", { state: "game", room, name });
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
    <StyledWrapper>
      <h1>kille online!</h1>
      <h2>
        {name} spelar i game {room}({gameState})
      </h2>
      <StyledContainer>
        {gameState == "game" ? (
          <GameBoard />
        ) : (
          <button onClick={startGame}>Start game</button>
        )}
      </StyledContainer>
      <StyledContainer>
        <input
          type="text"
          onChange={(event) => setChatMessage(event.target.value)}
          value={chatMessage}
          placeholder="chat"
        />

        <button onClick={sendChatMessage} disabled={!chatMessage.length}>
          Send chat
        </button>
        <StyledChatContainer>
          {chatMessages.map((message) => {
            return <p>{message}</p>;
          })}
        </StyledChatContainer>
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Game;
