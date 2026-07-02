const { MongoClient } = require("mongodb");
 
let db = null;
 
// Conecta a MongoDB y guarda la base de datos en la variable db.
async function conectarDB() { console.log("funcion conectar")
  try {
    console.log(process.env.MONGO_URI)
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Conectado a MongoDB correctamente");
    return db;
  } catch (err) {
    console.error("Error al conectar con MongoDB:", err);
    throw err;
  }
}
 
// Permite que otros archivos (como las rutas) accedan a la base de datos
// una vez ya se ha conectado.
function obtenerDB() {
  return db;
}
 
module.exports = { conectarDB, obtenerDB };