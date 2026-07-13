// const express = require("express");
import express from "express";
// const bcrypt = require("bcrypt");
import bcrypt from "bcrypt";
// const { ObjectId } = require("mongodb");
import { ObjectId } from "mongodb";

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

    let db = req.app.locals.db;

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

    let db = req.app.locals.db;
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

    res.send({
      mensaje: "Login correcto",
      usuario: { _id: usuario._id, username: usuario.username },
    });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al iniciar sesión: " + err });
  }
});

// DELETE /usuarios/:id
router.delete("/:id", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    if (userId !== req.params.id) {
      res.status(403).send({ mensaje: "No puedes eliminar la cuenta de otro usuario" });
      return;
    }

    let db = req.app.locals.db;

    let resultado = await db.collection("usuarios").deleteOne({ _id: new ObjectId(userId) });

    await db.collection("resenas").deleteMany({ usuarioId: userId });
    await db.collection("comentarios").deleteMany({ usuarioId: userId });

    if (resultado.deletedCount === 0) {
      res.status(404).send({ mensaje: "No se ha encontrado el usuario" });
      return;
    }

    res.send({ mensaje: "Cuenta eliminada correctamente" });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al eliminar la cuenta: " + err });
  }
});

// PUT /usuarios/:id
// Actualizar el nombre de usuario
router.put("/:id", async function (req, res) {
  try {
    let userId = req.headers["x-user-id"];

    if (!userId) {
      res.status(401).send({ mensaje: "No has iniciado sesión" });
      return;
    }

    if (userId !== req.params.id) {
      res.status(403).send({ mensaje: "No puedes editar la cuenta de otro usuario" });
      return;
    }

    let nuevoUsername = req.body.username;

    if (!nuevoUsername || nuevoUsername.trim() === "") {
      res.status(400).send({ mensaje: "El nombre de usuario no puede estar vacío" });
      return;
    }

    let db = req.app.locals.db;

    // Comprobamos que el nuevo nombre no lo tenga ya otro usuario
    let usuarioExistente = await db.collection("usuarios").findOne({ username: nuevoUsername });

    if (usuarioExistente !== null) {
      res.status(409).send({ mensaje: "Ese nombre de usuario ya está en uso" });
      return;
    }

    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { username: nuevoUsername } }
    );

    res.send({
      mensaje: "Nombre de usuario actualizado correctamente",
      usuario: { _id: userId, username: nuevoUsername }
    });
  } catch (err) {
    res.status(500).send({ mensaje: "Error al actualizar el usuario: " + err });
  }
});


export default router;

