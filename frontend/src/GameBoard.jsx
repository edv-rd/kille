import React from "react";

import PlayerCard from "./components/PlayerCard";

import styled from "styled-components";

import socket from "./utils/socket";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const StyledNameCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${(props) =>
    props.has_turn === "true"
      ? "2px solid red"
      : props.alive === "false"
      ? "2px solid grey"
      : "2px solid black"};
  padding: 5px;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const GameBoard = ({ game, checkHasTurn }) => {
  return (
    <StyledWrapper>
      {game.players.map((player) => {
        const hasTurn = checkHasTurn(player.id);

        // fått för mig att man måste göra detta
        // pga styled-components och booleans
        // idk!

        let has_turn = "false";
        if (hasTurn) {
          has_turn = "true";
        }
        let alive = "false";

        if (player.alive) {
          alive = "true";
        }
        let is_winner = "false";
        if (player.winner) {
          is_winner = "true";
        }

        const playerCard = player.card.shown
          ? player.card
          : player.id === socket.id
          ? player.card
          : "";
        return (
          <StyledContainer key={player.id}>
            <StyledNameCard alive={alive} has_turn={has_turn}>
              {player.name}
            </StyledNameCard>
            <PlayerCard
              alive={alive}
              card={playerCard}
              has_turn={has_turn}
              is_winner={is_winner}
            />
          </StyledContainer>
        );
      })}
    </StyledWrapper>
  );
};

export default GameBoard;
