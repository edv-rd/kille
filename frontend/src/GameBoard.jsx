import React from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled.div`
  border: 3px solid black;
  border-radius: 5px;
  padding: 10px;
  width: 100px;
  height: 150px;
  overflow: clip;
  word-wrap: break-word;
`;

const StyledCardText = styled.h1``;

const GameBoard = ({ card }) => {
  return (
    <StyledWrapper>
      <StyledCard>
        <StyledCardText>{card.name}</StyledCardText>
      </StyledCard>
    </StyledWrapper>
  );
};

export default GameBoard;
