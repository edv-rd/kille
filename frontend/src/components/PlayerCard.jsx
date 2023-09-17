import React from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCard = styled.div`
  border: ${(props) => (props.hasTurn ? "3px solid red" : "3px solid black")};
  border-radius: 5px;
  padding: 10px;
  width: 100px;
  height: 150px;
  overflow: clip;
  word-wrap: break-word;
`;

const StyledCardText = styled.h1``;

const PlayerCard = ({ card, hasTurn }) => {
  console.log(hasTurn);
  return (
    <StyledCard hasTurn={hasTurn}>
      <StyledCardText>{card.name}</StyledCardText>
    </StyledCard>
  );
};

export default PlayerCard;
