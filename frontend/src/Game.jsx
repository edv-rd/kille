import React, { useState, useEffect } from "react";
import socket from "./utils/socket.js";
import GameBoard from "./GameBoard.jsx";
import NameList from "./components/NameList.jsx";
import GameControls from "./components/GameControls.jsx";
import Chat from "./components/Chat.jsx";
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

const Game = ({ room, name, testScenario }) => {
  const [gameObject, setGameObject] = useState({});

  const handleAction = (action) => {
    socket.emit("handle_action", { room, action, gameObject });
  };

  const startGame = () => {
    socket.emit("start_game", { room, name });
  };

  useEffect(() => {
    socket.emit("join_room", { room });
  }, []);

  useEffect(() => {
    socket.on("recieve_game", (game) => {
      console.log("recieve_game");
      setGameObject(game);
    });
  }, [socket]);

  const checkHasTurn = (id) => {
    if (gameObject.players[gameObject.turn]) {
      return id === gameObject.players[gameObject.turn].id;
    } else {
      return false;
    }
  };

  const isMyTurn = () => {
    if (gameObject.players[gameObject.turn]) {
      return socket.id === gameObject.players[gameObject.turn].id;
    } else {
      return false;
    }
  };

  return (
    <StyledWrapper>
      {gameObject.players && (
        <>
          <h1>kille online!</h1>
          <p>
            {name} spelar i game {room} ({gameObject.state}) med{" "}
            {gameObject.players.length} spelare just nu
          </p>
          {gameObject.state == "lobby" && (
            <NameList players={gameObject.players} />
          )}

          <StyledContainer>
            {gameObject.state == "game" ? (
              <>
                {gameObject.players.length > 1 && (
                  <>
                    <GameBoard game={gameObject} checkHasTurn={checkHasTurn} />
                    <GameControls
                      yourTurn={isMyTurn()}
                      handleAction={handleAction}
                      gameState={gameObject.state}
                      startGame={startGame}
                    />
                  </>
                )}
              </>
            ) : gameObject.state == "end" ? (
              <>
                {gameObject.players && (
                  <>
                    <GameBoard game={gameObject} checkHasTurn={checkHasTurn} />
                    <GameControls
                      yourTurn={isMyTurn()}
                      handleAction={handleAction}
                      gameState={gameObject.state}
                      startGame={startGame}
                    />
                  </>
                )}

                <h1>Game ended!</h1>
              </>
            ) : (
              <button onClick={startGame}>Start game</button>
            )}
          </StyledContainer>
          <Chat room={room} />
        </>
      )}
    </StyledWrapper>
  );
};

export default Game;
