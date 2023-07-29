import Game from "./Game.jsx";
import socket from "./utils/socket.js";
import styled from "styled-components";
import { useState, useEffect } from "react";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const App = () => {
  const [userName, setUserName] = useState("");
  const [typedUserName, setTypedUserName] = useState("");

  const [roomNumber, setRoomNumber] = useState("");
  const [typedRoomNumber, setTypedRoomNumber] = useState("1");

  const handleJoin = () => {
    socket.emit("change_name", { name: typedUserName });
    socket.emit("join_room", { room: typedRoomNumber });
  };

  useEffect(() => {
    socket.on("recieve_name", (userName) => {
      setUserName(userName);
    });

    socket.on("recieve_room", (room) => {
      setRoomNumber(room);
    });
  }, [socket]);

  return (
    <StyledWrapper>
      {userName && roomNumber ? (
        <Game room={roomNumber} name={userName} />
      ) : (
        <StyledContainer>
          vad heter du?
          <input
            type="text"
            name="userName"
            value={typedUserName}
            onChange={(event) => setTypedUserName(event.target.value)}
          />
          vilket rum?
          <input
            type="text"
            name="roomNumber"
            value={typedRoomNumber}
            onChange={(event) => setTypedRoomNumber(event.target.value)}
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={!typedUserName && !typedRoomNumber}
          >
            enter
          </button>
        </StyledContainer>
      )}
    </StyledWrapper>
  );
};

export default App;
