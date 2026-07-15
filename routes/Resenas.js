// const express = require("express");
import express from "express";
// const { ObjectId } = require("mongodb");
import { ObjectId } from "mongodb";

const router = express.Router();

// GET /resenas
router.get("/", async function (req, res) {
  try {
    let db = req.app.locals.db;
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
router.get("/:id", async function (req, res) {
  try {
    let db = req.app.locals.db;
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
router.post("/", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    let cancion = req.body.cancion;
    let artista = req.body.artista;
    let nota = Number(req.body.nota);
    let texto = req.body.texto;

    let deezerId = req.body.deezerId || null;
    let portada = req.body.portada || "";

    if (!cancion || !artista) {
      res.status(400).send({ mensaje: "La canción y el artista son obligatorios" });
      return;
    }

    if (!nota || nota < 1 || nota > 5) {
      res.status(400).send({ mensaje: "La nota debe ser un número entre 1 y 5" });
      return;
    }

    let db = req.app.locals.db;

    // Buscamos el usuario para obtener su username
    let usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) });

    if (usuario === null) {
      res.status(401).send({ mensaje: "Usuario no válido" });
      return;
    }

    let nuevaResena = {
      usuarioId: userId,
      nombreUsuario: usuario.username,
      cancion: cancion,
      artista: artista,
      nota: nota,
      texto: texto || "",
      deezerId: deezerId, 
      portada: portada,
      fecha: new Date(),
      likes: []
    };

    let resultado = await db.collection("resenas").insertOne(nuevaResena);

    res.send({ ...nuevaResena, _id: resultado.insertedId });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al crear la reseña: " + err });
  }
});

// DELETE /resenas/:id
router.delete("/:id", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    let db = req.app.locals.db;
    let resena = await db
      .collection("resenas")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (resena === null) {
      res.status(404).send({ mensaje: "Reseña no encontrada" });
      return;
    }

    if (resena.usuarioId !== userId) {
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

// PUT /resenas/:id/like
router.put("/:id/like", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    let db = req.app.locals.db;
    let resenaId = req.params.id;

    // Buscamos la reseña
    let resena = await db.collection("resenas").findOne({ _id: new ObjectId(resenaId) });

    if (!resena) {
      res.status(404).send({ mensaje: "Reseña no encontrada" });
      return;
    }

    // Inicializamos el array de likes si por algún motivo no existiera en reseñas antiguas
    let likes = resena.likes || [];
    let queryAccion;

    if (likes.includes(userId)) {
      // Si el usuario ya le dio like, se lo quitamos ($pull)
      queryAccion = { $pull: { likes: userId } };
    } else {
      // Si no le ha dado, se lo añadimos ($addToSet evita duplicados)
      queryAccion = { $addToSet: { likes: userId } };
    }

    // Actualizamos en la base de datos
    await db.collection("resenas").updateOne(
      { _id: new ObjectId(resenaId) },
      queryAccion
    );

    // Buscamos la reseña actualizada para devolver los nuevos likes al frontend
    let resenaActualizada = await db.collection("resenas").findOne({ _id: new ObjectId(resenaId) });

    res.send({ likes: resenaActualizada.likes || [] });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al procesar el like: " + err });
  }
});

export default router;