// const { MongoClient } = require("mongodb");
import { MongoClient } from "mongodb";
 

 
// Conecta a MongoDB y guarda la base de datos en la variable db.
async function conectarDB(app) { console.log("funcion conectar")
  try {
    // console.log(process.env.MONGO_URI)
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    app.locals.db = client.db("proyectofinal");
    console.log("Conectado a MongoDB correctamente");
    // return db;
  } catch (err) {
    console.error("Error al conectar con MongoDB:", err);
    throw err;
  }
}
 

 
export default  conectarDB ;