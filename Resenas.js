const express = require("express");
const { ObjectId } = require("mongodb");
const { obtenerDB } = require("../db");
const requiereLogin = require("../middlewares/requiereLogin");

const router = express.Router();

// GET /resenas
// Devuelve el feed completo, mas recientes primero
router.get("/", async function (req, res) {
  try {
    let db = obtenerDB();
    let resenas = await db
      .collection("resenas")
      .find()
      .sort({ fecha: -1 })
      .toArray();

    res.send(resenas);
  } catch (err) {
    res.status(500).send({ mensaje: "Error al obtener las reseñas: " + err });
  }
});

// GET /resenas/:id
// Devuelve el detalle de una reseña concreta
router.get("/:id", async function (req, res) {
  try {
    let db = obtenerDB();
    let resena = await db
      .collection("resenas")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (resena === null) {
      res.status(404).send({ mensaje: "Reseña no encontrada" });
      return;
    }

    res.send(resena);
  } catch (err) {
    res.status(500).send({ mensaje: "Error al obtener la reseña: " + err });
  }
});

// POST /resenas
// Crear una reseña nueva. Requiere estar logueado.
router.post("/", requiereLogin, async function (req, res) {
  try {
    let cancion = req.body.cancion;
    let artista = req.body.artista;
    let nota = Number(req.body.nota);
    let texto = req.body.texto;

    if (!cancion || !artista) {
      res.status(400).send({ mensaje: "La canción y el artista son obligatorios" });
      return;
    }

    if (!nota || nota < 1 || nota > 5) {
      res.status(400).send({ mensaje: "La nota debe ser un número entre 1 y 5" });
      return;
    }

    let db = obtenerDB();

    let nuevaResena = {
      usuarioId: req.usuario._id.toString(),
      nombreUsuario: req.usuario.username,
      cancion: cancion,
      artista: artista,
      nota: nota,
      texto: texto || "",
      fecha: new Date(),
    };

    let resultado = await db.collection("resenas").insertOne(nuevaResena);

    res.send({ ...nuevaResena, _id: resultado.insertedId });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al crear la reseña: " + err });
  }
});

// DELETE /resenas/:id
// Solo el autor de la reseña puede borrarla
router.delete("/:id", requiereLogin, async function (req, res) {
  try {
    let db = obtenerDB();
    let resena = await db
      .collection("resenas")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (resena === null) {
      res.status(404).send({ mensaje: "Reseña no encontrada" });
      return;
    }

    if (resena.usuarioId !== req.usuario._id.toString()) {
      res.status(403).send({ mensaje: "No puedes borrar la reseña de otro usuario" });
      return;
    }

    await db.collection("resenas").deleteOne({ _id: new ObjectId(req.params.id) });
    await db.collection("comentarios").deleteMany({ resenaId: req.params.id });

    res.send({ mensaje: "Reseña eliminada correctamente" });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al eliminar la reseña: " + err });
  }
});

module.exports = router;