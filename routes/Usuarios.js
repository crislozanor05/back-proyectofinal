const express = require("express");
const bcrypt = require("bcrypt");
// const { obtenerDB } = require("../db");
// const requiereLogin = require("../middlewares/requiereLogin");

const router = express.Router();

// const LONGITUD_MINIMA_PASSWORD = 8;

// POST /usuarios/registro
router.post("/registro", async function (req, res) {
  const user = req.body;
  console.log(user);
  // const db = obtenerDB()
  req.app.locals.db.collection("usuarios").insertOne(user);
  res.send(user);
});

router.get("/usuarios", async function (req, res) {
  res.send("hola desde usuarios");
});
module.exports = router;
