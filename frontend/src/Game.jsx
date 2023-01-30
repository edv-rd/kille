import ShowDeck from "./components/ShowDeck";
import ShowCard from "./components/ShowCard";
import DealCard from "./components/DealCard";

export default function Game({ game }) {
  return (
    <>
      <h1>kille online!</h1>
      <h2>spelar i game {game}</h2>
      <ShowDeck />
      <ShowCard />
      <DealCard />
    </>
  );
}
