import React from "react";

import PlayerCard from "./components/PlayerCard";

import styled from "styled-components";

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
    props.hasTurn
      ? "2px solid red"
      : !props.alive
      ? "2px solid grey"
      : "2px solid black"};
  padding: 5px;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const GameBoard = ({ players, turnId }) => {
  return (
    <StyledWrapper>
      {players.map((player) => {
        const hasTurn = player.id === turnId;

        return (
          <StyledContainer>
            <StyledNameCard alive={player.alive} hasTurn={hasTurn}>
              {player.name}
            </StyledNameCard>
            <PlayerCard
              alive={player.alive}
              card={player.card}
              hasTurn={hasTurn}
            />
          </StyledContainer>
        );
      })}
    </StyledWrapper>
  );
};

export default GameBoard;
