import React, { useState, useEffect } from "react";
import socket from "./utils/socket.js";
import GameBoard from "./GameBoard.jsx";
import NameList from "./components/NameList.jsx";
import GameControls from "./components/GameControls.jsx";
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
  const [playerCount, setPlayerCount] = useState(0);
  const [gameState, setGameState] = useState("lobby");
  const [playerNames, setPlayerNames] = useState([]);
  const [yourTurn, setYourTurn] = useState(false);
  const [card, setCard] = useState();

  const handleAction = (action) => {
    socket.emit("handle_action", { action, room, card });
    setYourTurn(false);
  };

  const sendChatMessage = () => {
    socket.emit("send_message", { message: chatMessage, room, name });
    setChatMessage("");
  };

  const startGame = () => {
    socket.emit("start_game", { room, name });
  };

  useEffect(() => {
    socket.emit("join_room", { room });
  }, []);

  useEffect(() => {
    socket.on("recieve_message", (message) => {
      setChatMessages((oldArray) => [message, ...oldArray]);
    });

    socket.on("recieve_state", (state) => {
      setGameState(state);
    });

    socket.on("update_players", (playerCount, playerNames) => {
      setPlayerCount(playerCount);
      setPlayerNames(playerNames);
    });

    socket.on("recieve_card", (card) => {
      console.log(card);

      setCard(card);
    });

    socket.on("your_turn", () => {
      console.log("My turn!");
      setYourTurn(true);
    });
  }, [socket]);

  return (
    <StyledWrapper>
      <h1>kille online!</h1>
      <p>
        {name} spelar i game {room}({gameState}) med {playerCount} spelare just
        nu
      </p>
      <NameList names={playerNames} />

      <StyledContainer>
        {gameState == "game" ? (
          <>
            {card && <GameBoard card={card} />}
            <GameControls yourTurn={yourTurn} handleAction={handleAction} />
          </>
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
