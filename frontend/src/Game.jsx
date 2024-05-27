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

const Game = ({ room, name, playerId }) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [turnId, setTurnId] = useState();

  const [players, setPlayers] = useState([]);

  const [gameState, setGameState] = useState("lobby");
  const [yourTurn, setYourTurn] = useState(false);

  const handleAction = (action) => {
    socket.emit("handle_action", { action, room });
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

    socket.on("update_players", (players) => {
      setPlayers(players);
    });

    socket.on("set_unalive", (id) => {
      setPlayers((prev) => {
        return prev.map((player) => {
          if (player.id === id) {
            return { ...player, alive: "false" }; // Update the card value
          }
          return player; // Return the unchanged object for other players
        });
      });
    });

    socket.on("set_winner", (id) => {
      setPlayers((prev) => {
        return prev.map((player) => {
          if (player.id === id) {
            return { ...player, is_winner: "true" }; // Update the card value
          }
          return player; // Return the unchanged object for other players
        });
      });
    });

    socket.on("show_card", ({ card, id }) => {
      setPlayers((prev) => {
        return prev.map((player) => {
          if (player.id === id) {
            console.log(`showing ${card.name}`);
            console.log(`from ${player.name}`);
            return { ...player, card: card }; // Update the card value
          }
          return player; // Return the unchanged object for other players
        });
      });
    });

    socket.on("your_turn", () => {
      setYourTurn(true);
    });

    socket.on("set_turn", (id) => {
      setTurnId(id);
    });
  }, [socket]);

  return (
    <StyledWrapper>
      <h1>kille online!</h1>
      <p>
        {name} spelar i game {room} ({gameState}) med {players.length} spelare
        just nu
      </p>
      {gameState == "lobby" && <NameList players={players} />}

      <StyledContainer>
        {gameState == "game" ? (
          <>
            {players && (
              <GameBoard
                players={players}
                turnId={turnId}
                playerId={playerId}
              />
            )}
            <GameControls yourTurn={yourTurn} handleAction={handleAction} />
          </>
        ) : gameState == "end" ? (
          <>
            {players && <GameBoard players={players} />}

            <h1>Game ended!</h1>
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
            return <p key={message}>{message}</p>;
          })}
        </StyledChatContainer>
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Game;
