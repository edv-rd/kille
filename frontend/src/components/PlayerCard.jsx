import React from "react";
import styled, { css } from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled.div`
  border: ${(props) =>
    props.is_winner === "true"
      ? "3px solid green"
      : props.has_turn === "true"
      ? "3px solid red"
      : props.alive === "false"
      ? "3px solid grey"
      : "3px solid black"};
  border-radius: 5px;
  padding: 10px;
  width: 100px;
  height: 150px;
  overflow: clip;
  word-wrap: break-word;
  ${(props) =>
    props.is_winner === "true"
      ? css`
          background-color: #48e40567;
        `
      : ""}
`;

const StyledCardText = styled.h1`
  color: ${(props) => (props.alive ? "black" : "grey")};
`;
const PlayerCard = ({ card, has_turn, alive, is_winner }) => {
  return (
    <StyledCard alive={alive} has_turn={has_turn} is_winner={is_winner}>
      <StyledCardText alive={alive}>{card ? card.name : " "}</StyledCardText>
    </StyledCard>
  );
};

export default PlayerCard;
