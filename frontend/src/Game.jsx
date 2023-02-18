import ShowDeck from "./components/ShowDeck";
import ShowCard from "./components/ShowCard";
import DealCard from "./components/DealCard";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Game({ game }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const configuration = {
      method: "get",
      url: "http://localhost:3000/deck/create",
    };
    axios(configuration)
      .then((response) => {
        setCards(response.data);
      })
      .catch((err) => {
        err = new Error(err.message);
      });
  }, []);

  return (
    <>
      <h1>kille online!</h1>
      <h2>spelar i game {game}</h2>
      <h3>skapat nytt deck med id {game}</h3>
      <ShowDeck {...cards} />
      <ShowCard />
      <DealCard />
    </>
  );
}
