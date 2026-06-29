require("dotenv").config();

const express = require("express");
const { conectarDB } = require("./db");

const app = express();

app.get("/", function (req, res) {
  res.send({ mensaje: "API de Tracklist funcionando" });
});

async function start() {
  try {
    await conectarDB();
    app.listen(process.env.PORT);
    console.log("Servidor escuchando en el puerto " + process.env.PORT);
  } catch (err) {
    console.error("No se ha podido iniciar el servidor:", err);
  }
}

start();