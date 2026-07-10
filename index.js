// require("dotenv").config();
import { dotenv } from "dotenv";







// const express = require("express");
import {express} from "express";
// const cors = require("cors");
import {cors} from "cors";
// const  conectarDB  = require("./db.js");
import {conectarDB} from "./db.js";

dotenv.config()


// const usuariosRouter = require("./routes/usuarios.js");
import {usuariosRouter} from "./routes/usuarios.js";
// const resenasRouter = require("./routes/resenas");
import {resenasRouter} from "./routes/resenas";
// const comentariosRouter = require("./routes/comentarios");
import {comentariosRouter} from "./routes/comentarios";

// const app = express();
import {app} from express;


app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/usuarios", usuariosRouter);
app.use("/resenas", resenasRouter);
app.use("/comentarios", comentariosRouter);


app.get("/", function (req, res) {
  res.send({ mensaje: "API de Tracklist funcionando" });
});

//Arranque: primero conectamos a la base de datos, luego abrimos el servidor
async function start() {
  try {
    await conectarDB(app);
    app.listen(process.env.PORT || 3001);
    console.log("Servidor escuchando en el puerto " + (process.env.PORT || 3001));
  } catch (err) {
    console.error("No se ha podido iniciar el servidor:", err);
  }
}

start();

export default app 