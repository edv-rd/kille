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
  border: ${(props) => (props.hasTurn ? "2px solid red" : "2px solid black")};
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
        console.log(turnId);
        console.log(player.id);

        const hasTurn = player.id === turnId;
        console.log(hasTurn);
        return (
          <StyledContainer>
            <StyledNameCard hasTurn={hasTurn}>{player.name}</StyledNameCard>
            <PlayerCard card={player.card} hasTurn={hasTurn} />
          </StyledContainer>
        );
      })}
    </StyledWrapper>
  );
};

export default GameBoard;
