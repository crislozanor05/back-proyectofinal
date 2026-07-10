require("dotenv").config();






const express = require("express");
const cors = require("cors");
const  conectarDB  = require("./db.js");



const usuariosRouter = require("./routes/usuarios.js");
const resenasRouter = require("./routes/resenas");
const comentariosRouter = require("./routes/comentarios");

const app = express();


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