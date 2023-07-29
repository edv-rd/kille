import Game from "./Game.jsx";
import socket from "./utils/socket.js";
import styled from "styled-components";
import { useState, useEffect } from "react";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const App = () => {
  const [userName, setUserName] = useState("");
  const [typedUserName, setTypedUserName] = useState("");

  const handleUserName = () => {
    socket.emit("change_name", { name: typedUserName });
  };

  useEffect(() => {
    console.log("username?");
    socket.on("recieve_name", (userName) => {
      console.log("recieved username", userName);
      setUserName(userName);
    });
  }, [socket]);

  return (
    <StyledWrapper>
      {userName ? (
        <Game room="666" name={userName} />
      ) : (
        <StyledContainer>
          vad heter du?
          <input
            type="text"
            name="userName"
            value={typedUserName}
            onChange={(event) => setTypedUserName(event.target.value)}
          />
          <button type="button" onClick={handleUserName}>
            enter
          </button>
        </StyledContainer>
      )}
    </StyledWrapper>
  );
};

export default App;
