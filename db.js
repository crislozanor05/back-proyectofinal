import { MongoClient } from "mongodb";

let cliente = null;
let db = null;

async function conectarDB() {
  // Si ya estamos conectados, devolvemos la base de datos guardada en caché
  if (db) return db;

  if (!process.env.MONGO_URI) {
    throw new Error("Falta la variable de entorno MONGO_URI");
  }

  // Si no hay cliente creado, lo creamos
  if (!cliente) {
    cliente = new MongoClient(process.env.MONGO_URI);
    await cliente.connect();
  }

  // Guardamos la base de datos en la variable global de caché
  db = cliente.db("tu_nombre_de_base_de_datos"); // O déjalo vacío si el nombre viene en la URI
  console.log("Conectado con éxito a MongoDB Atlas");
  return db;
}

export default conectarDB;