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
  border: 2px solid black;
  padding: 5px;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const GameBoard = ({ players }) => {
  return (
    <StyledWrapper>
      {players.map((player) => {
        return (
          <StyledContainer>
            <StyledNameCard>{player.name}</StyledNameCard>
            <PlayerCard card={player.card} />
          </StyledContainer>
        );
      })}
    </StyledWrapper>
  );
};

export default GameBoard;
