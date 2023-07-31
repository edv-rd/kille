import socket from "./utils/socket";
import { useState, useEffect } from "react";

const GameBoard = () => {
  const [card, setCard] = useState("");
  useEffect(() => {
    socket.on("recieve_card", (card) => {
      setCard(card);
    });
  }, [socket]);
  return (
    <>
      <h1>Gameboard</h1>
      <h2>kort: {card}</h2>
    </>
  );
};

export default GameBoard;
