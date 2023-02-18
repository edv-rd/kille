import axios from "axios";
import { useState, useEffect } from "react";

export default function ShowDeck(cards) {
  return (
    <>
      <h3>Leken:</h3>
      <div className="cards">
        {Object.values(cards).map((card, i) => (
          <div className="card" key={i}>
            <p className="card-text">{card}</p>
          </div>
        ))}
      </div>
    </>
  );
}
