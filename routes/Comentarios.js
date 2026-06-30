const express = require("express");
const { obtenerDB } = require("../db");
const requiereLogin = require("../middleware/requiereLogin");

const router = express.Router();

// GET /comentarios/:resenaId
// Comentarios de una reseña concreta, ordenados del mas antiguo al mas nuevo
router.get("/:resenaId", async function (req, res) {
  try {
    let db = obtenerDB();
    let comentarios = await db
      .collection("comentarios")
      .find({ resenaId: req.params.resenaId })
      .sort({ fecha: 1 })
      .toArray();

    res.send(comentarios);
  } catch (err) {
    res.status(500).send({ mensaje: "Error al obtener los comentarios: " + err });
  }
});

// POST /comentarios
// Crear un comentario nuevo. Requiere estar logueado.
router.post("/", requiereLogin, async function (req, res) {
  try {
    let resenaId = req.body.resenaId;
    let texto = req.body.texto;

    if (!resenaId || !texto || texto.trim() === "") {
      res.status(400).send({ mensaje: "El comentario no puede estar vacío" });
      return;
    }

    let db = obtenerDB();

    let nuevoComentario = {
      resenaId: resenaId,
      usuarioId: req.usuario._id.toString(),
      nombreUsuario: req.usuario.username,
      texto: texto,
      fecha: new Date(),
    };

    let resultado = await db.collection("comentarios").insertOne(nuevoComentario);

    res.send({ ...nuevoComentario, _id: resultado.insertedId });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al crear el comentario: " + err });
  }
});

module.exports = router;