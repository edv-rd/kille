import { useEffect, useRef } from "react";
import io from "socket.io-client";
import Game from "./Game.jsx";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const App = () => {
  return (
    <StyledWrapper>
      <Game room="666" />
    </StyledWrapper>
  );
};

export default App;
