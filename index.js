// require("dotenv").config();
import dotenv  from "dotenv";
import dns from "dns";


dns.setServers(["8.8.8.8", "8.8.4.4"])






// const express = require("express");
import express from "express";
// const cors = require("cors");
import cors from "cors";
// const  conectarDB  = require("./db.js");
import conectarDB from "./db.js";

dotenv.config()


// const usuariosRouter = require("./routes/usuarios.js");
import usuariosRouter from "./routes/Usuarios.js";
// const resenasRouter = require("./routes/resenas");
import resenasRouter from "./routes/Resenas.js";
// const comentariosRouter = require("./routes/comentarios");
import comentariosRouter from "./routes/Comentarios.js";
import buscadorRouter from "./routes/Buscador.js";

const app = express();



app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/usuarios", usuariosRouter);
app.use("/resenas", resenasRouter);
app.use("/comentarios", comentariosRouter);
app.use("/buscador", buscadorRouter);


app.get("/", function (req, res) {
  res.send({ mensaje: "API funcionando" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor listo");
});


export default app 