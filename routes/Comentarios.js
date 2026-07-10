const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

// GET /comentarios/:resenaId
router.get("/:resenaId", async function (req, res) {
  try {
    let db = req.app.locals.db;
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
router.post("/", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    let resenaId = req.body.resenaId;
    let texto = req.body.texto;

    if (!resenaId || !texto || texto.trim() === "") {
      res.status(400).send({ mensaje: "El comentario no puede estar vacío" });
      return;
    }

    let db = req.app.locals.db;

    // Buscamos el usuario para obtener su username
    let usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) });

    if (usuario === null) {
      res.status(401).send({ mensaje: "Usuario no válido" });
      return;
    }

    let nuevoComentario = {
      resenaId: resenaId,
      usuarioId: userId,
      nombreUsuario: usuario.username,
      texto: texto,
      fecha: new Date(),
    };

    let resultado = await db.collection("comentarios").insertOne(nuevoComentario);

    res.send({ ...nuevoComentario, _id: resultado.insertedId });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al crear el comentario: " + err });
  }
});

// DELETE /comentarios/:id
router.delete("/:id", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    let db = req.app.locals.db;
    let comentario = await db
      .collection("comentarios")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (comentario === null) {
      res.status(404).send({ mensaje: "Comentario no encontrado" });
      return;
    }

    if (comentario.usuarioId !== userId) {
      res.status(403).send({ mensaje: "No puedes borrar el comentario de otro usuario" });
      return;
    }

    await db.collection("comentarios").deleteOne({ _id: new ObjectId(req.params.id) });

    res.send({ mensaje: "Comentario eliminado correctamente" });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al eliminar el comentario: " + err });
  }
});

module.exports = router;