import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import Game from "./Game.jsx";

export default function App() {
  const [game, setGame] = useState("");
  const [typedGame, setTypedGame] = useState("");

  return game ? (
    <Game game={game} />
  ) : (
    <Form.Group>
      <Form.Control
        type="text"
        name="game"
        value={typedGame}
        onChange={(e) => setTypedGame(e.target.value)}
      />

      <Button type="submit" onClick={() => setGame(typedGame)}>
        joina spel
      </Button>
    </Form.Group>
  );
}
