const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { obtenerDB } = require("../db");
const requiereLogin = require("../middleware/requiereLogin");

const router = express.Router();

const LONGITUD_MINIMA_PASSWORD = 8;

// POST /usuarios/registro
router.post("/registro", async function (req, res) {
  try {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || username.trim() === "") {
      res.status(400).send({ mensaje: "El nombre de usuario es obligatorio" });
      return;
    }

    if (!password || password.length < LONGITUD_MINIMA_PASSWORD) {
      res.status(400).send({
        mensaje: `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres`,
      });
      return;
    }

    let db = obtenerDB();

    // Comprobamos si ya existe un usuario con ese nombre (evitar duplicados)
    let usuarioExistente = await db.collection("usuarios").findOne({ username: username });

    if (usuarioExistente !== null) {
      res.status(409).send({ mensaje: "Ese nombre de usuario ya está en uso" });
      return;
    }

    let passwordCifrada = bcrypt.hashSync(password, 10);

    let resultado = await db.collection("usuarios").insertOne({
      username: username,
      password: passwordCifrada,
      fechaRegistro: new Date(),
    });

    res.send({
      mensaje: "Usuario registrado correctamente",
      usuario: { _id: resultado.insertedId, username: username },
    });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al registrar el usuario: " + err });
  }
});

// POST /usuarios/login
router.post("/login", async function (req, res) {
  try {
    let username = req.body.username;
    let password = req.body.password;

    let db = obtenerDB();
    let usuario = await db.collection("usuarios").findOne({ username: username });

    if (usuario === null) {
      res.status(404).send({ mensaje: "El usuario no existe" });
      return;
    }

    let coincide = bcrypt.compareSync(password, usuario.password);

    if (!coincide) {
      res.status(401).send({ mensaje: "Contraseña incorrecta" });
      return;
    }

    // No devolvemos nunca la contraseña cifrada al frontend
    res.send({
      mensaje: "Login correcto",
      usuario: { _id: usuario._id, username: usuario.username },
    });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al iniciar sesión: " + err });
  }
});

// DELETE /usuarios/:id
// Solo el propio usuario logueado puede eliminar su cuenta.
router.delete("/:id", requiereLogin, async function (req, res) {
  try {
    let idABorrar = req.params.id;

    if (req.usuario._id.toString() !== idABorrar) {
      res.status(403).send({ mensaje: "No puedes eliminar la cuenta de otro usuario" });
      return;
    }

    let db = obtenerDB();
    let resultado = await db.collection("usuarios").deleteOne({ _id: new ObjectId(idABorrar) });

    // Borramos tambien sus reseñas y comentarios, para no dejar datos huérfanos
    await db.collection("resenas").deleteMany({ usuarioId: idABorrar });
    await db.collection("comentarios").deleteMany({ usuarioId: idABorrar });

    if (resultado.deletedCount === 0) {
      res.status(404).send({ mensaje: "No se ha encontrado el usuario" });
      return;
    }

    res.send({ mensaje: "Cuenta eliminada correctamente" });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al eliminar la cuenta: " + err });
  }
});

module.exports = router;