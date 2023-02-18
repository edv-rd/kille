const dealer = require("./dealer");

const express = require("express");
const app = express();
const port = 3000;

let deckStruct = require("./deck.json");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("kille!");
});

app.get("/deck/create", (req, res) => {
  let deckStructArray = JSON.parse(JSON.stringify(deckStruct));

  let createdDeck = deckStructArray.map((card) => card);

  res.send(createdDeck);
});

app.get("/deck/deal", (req, res) => {});

app.listen(port, () => {
  console.log(`kille server igång på ${port}`);
});
