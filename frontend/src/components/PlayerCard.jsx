import React from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled.div`
  border: ${(props) =>
    props.hasTurn
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
`;

const StyledCardText = styled.h1`
  color: ${(props) => (props.alive ? "black" : "grey")};
`;
const PlayerCard = ({ card, hasTurn, alive }) => {
  return (
    <StyledCard alive={alive} hasTurn={hasTurn}>
      <StyledCardText alive={alive}>{card.name}</StyledCardText>
    </StyledCard>
  );
};

export default PlayerCard;
