import socket from "./utils/socket";
import { useState, useEffect } from "react";

const GameBoard = ({ card }) => {
  return (
    <>
      <h1>Gameboard</h1>
      <h2>kort: {card}</h2>
    </>
  );
};

export default GameBoard;
