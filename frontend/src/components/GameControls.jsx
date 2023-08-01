import styled from "styled-components";
import socket from "../utils/socket";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const StyledButton = styled.button`
  font-size: 15px;
`;

const GameControls = ({ yourTurn, handleAction }) => {
  return (
    <StyledWrapper>
      <StyledButton disabled={!yourTurn} onClick={() => handleAction("hold")}>
        Hold
      </StyledButton>
      <StyledButton disabled={!yourTurn} onClick={() => handleAction("change")}>
        Change
      </StyledButton>
    </StyledWrapper>
  );
};

export default GameControls;
