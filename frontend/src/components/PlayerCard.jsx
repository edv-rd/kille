import React from "react";
import styled, { css } from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled.div`
  border: ${(props) =>
    props.isWinner
      ? "3px solid green"
      : props.hasTurn
      ? "3px solid red"
      : !props.alive
      ? "3px solid grey"
      : "3px solid black"};
  border-radius: 5px;
  padding: 10px;
  width: 100px;
  height: 150px;
  overflow: clip;
  word-wrap: break-word;
  ${(props) =>
    props.isWinner
      ? css`
          background-color: green;
        `
      : ""}
`;

const StyledCardText = styled.h1`
  color: ${(props) => (props.alive ? "black" : "grey")};
`;
const PlayerCard = ({ card, hasTurn, alive, isWinner }) => {
  return (
    <StyledCard alive={alive} hasTurn={hasTurn} isWinner={isWinner}>
      <StyledCardText alive={alive}>{card.name}</StyledCardText>
    </StyledCard>
  );
};

export default PlayerCard;
