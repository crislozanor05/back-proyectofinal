// const { ObjectId } = require("mongodb");
import { ObjectId } from "mongodb";
// const { obtenerDB } = require("../db");
import {obtenerDB} from "../db";


// El frontend debe enviar el id del usuario logueado en la cabecera "x-user-id".
// Si el id no existe o no corresponde a un usuario real, se rechaza la peticion.
async function requiereLogin(req, res, next) {
  let userId = req.headers["x-user-id"];

  if (!userId) {
    res.status(401).send({ mensaje: "No has iniciado sesión" });
    return;
  }

  try {
    let db = obtenerDB();
    let usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) });

    if (usuario === null) {
      res.status(401).send({ mensaje: "Usuario no válido" });
      return;
    }

    // Guardamos el usuario encontrado dentro de req, para que la siguiente
    // funcion pueda usarlo sin tener que volver a buscarlo.
    req.usuario = usuario;
    next();
  } catch (err) {
    res.status(500).send({ mensaje: "Error de autenticación: " + err });
  }
}

module.exports = requiereLogin;