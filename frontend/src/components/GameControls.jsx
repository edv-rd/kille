import React from "react";

import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const StyledButton = styled.button`
  font-size: 15px;
`;

const GameControls = ({ yourTurn, handleAction, gameState, startGame }) => {
  return (
    <StyledWrapper>
      <StyledButton disabled={!yourTurn} onClick={() => handleAction("hold")}>
        Hold
      </StyledButton>
      <StyledButton disabled={!yourTurn} onClick={() => handleAction("change")}>
        Change
      </StyledButton>
      {gameState === "end" && (
        <StyledButton onClick={() => startGame()}>Start new game!</StyledButton>
      )}
    </StyledWrapper>
  );
};

export default GameControls;
