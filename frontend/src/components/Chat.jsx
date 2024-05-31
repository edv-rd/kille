import React, { useState, useEffect } from "react";
import styled from "styled-components";
import socket from "../utils/socket";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
`;

const StyledChatContainer = styled(StyledContainer)`
  width: 100%;
`;

const Chat = ({ room }) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const sendChatMessage = () => {
    socket.emit("send_message", { message: chatMessage, room });
    setChatMessage("");
  };

  useEffect(() => {
    socket.on("recieve_message", (message) => {
      setChatMessages((oldArray) => [message, ...oldArray]);
    });
  }, [socket]);

  return (
    <StyledContainer>
      <input
        type="text"
        onChange={(event) => setChatMessage(event.target.value)}
        value={chatMessage}
        placeholder="chat"
      />

      <button onClick={sendChatMessage} disabled={!chatMessage.length}>
        Send chat
      </button>
      <StyledChatContainer>
        {chatMessages.map((message) => {
          return <p key={message}>{message}</p>;
        })}
      </StyledChatContainer>
    </StyledContainer>
  );
};

export default Chat;
