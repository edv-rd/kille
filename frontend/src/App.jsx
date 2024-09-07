import Game from "./Game.jsx";
import socket from "./utils/socket.js";
import styled from "styled-components";
import React, { useState, useEffect } from "react";

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

  const [playerId, setPlayerId] = useState();

  const [roomNumber, setRoomNumber] = useState("");
  const [typedRoomNumber, setTypedRoomNumber] = useState("1");

  const [testScenario, setTestScenario] = useState(false);

  const handleJoin = () => {
    {
      typedRoomNumber ? setRoomNumber(typedRoomNumber) : setRoomNumber("1");
    }
    socket.emit("change_name", { name: typedUserName });
  };

  const handleQuickEnter = () => {
    const stringArray = [
      "Ed",
      "Cliff",
      "Elvis",
      "Ålmannen",
      "Bosse",
      "Random",
      "Karta",
    ];
    const stringArrayTwo = [
      "Blomkvist",
      "Cool",
      "Knase",
      "Buffel",
      "DaGangzta",
      "Randomsson",
    ];

    const randomArray = Math.floor(Math.random() * stringArray.length);
    const randomArrayTwo = Math.floor(Math.random() * stringArrayTwo.length);

    const random1 = stringArray[randomArray];
    const random2 = stringArrayTwo[randomArrayTwo];

    const randomUserName = `${random1} ${random2}`;

    setTypedUserName(randomUserName);
    socket.emit("change_name", { name: typedUserName });
    setRoomNumber("1");
  };

  useEffect(() => {
    socket.on("recieve_name", (userName) => {
      setUserName(userName);
    });

    socket.on("recieve_room", (room) => {
      setRoomNumber(room);
    });

    socket.on("recieve_id", (id) => {
      setPlayerId(id);
    });
  }, [socket]);

  return (
    <StyledWrapper>
      {userName && roomNumber ? (
        <Game room={roomNumber} name={userName} playerId={playerId} />
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
          <button type="button" onClick={handleQuickEnter}>
            quick enter
          </button>
        </StyledContainer>
      )}
    </StyledWrapper>
  );
};

export default App;
