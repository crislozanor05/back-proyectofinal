import express from "express";

const router = express.Router();

// GET /buscador/canciones?q=nombre_cancion
router.get("/canciones", async function (req, res) {
  try {
    const query = req.query.q;
    
    if (!query || query.trim() === "") {
      res.status(400).send({ mensaje: "Debes proporcionar un término de búsqueda" });
      return;
    }

    // Hacemos un fetch directo a la API pública de Deezer
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`);

    if (!response.ok) {
      res.status(502).send({ mensaje: "Error al conectar con la API de Deezer" });
      return;
    }

    const data = await response.json();

    // Filtramos y limpiamos los datos de Deezer para mandar solo lo que React necesita
    const resultados = data.data.map((track) => ({
      deezerId: track.id,
      cancion: track.title,
      artista: track.artist.name,
      album: track.album.title,
      portada: track.album.cover_medium, // URL de la imagen (tamaño mediano, ideal para cards)
      previewUrl: track.preview,         // Audio de muestra de 30 segundos
    }));

    res.send(resultados);
  } catch (err) {
    res.status(500).send({ mensaje: "Error al realizar la búsqueda: " + err.message });
  }
});

export default router;