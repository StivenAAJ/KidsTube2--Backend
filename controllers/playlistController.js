const Playlist = require("../models/playlistModel");
const RestrictedUser = require("../models/restrictedUserModel");
const Video = require("../models/videoModel");


// Obtener todas las playlists o una en específico por ID
const getPlaylists = async (req, res) => {
    try {
      if (req.query.id) {
        const playlist = await Playlist.findById(req.query.id)
          .populate("profiles", "fullName") // Mostrar solo el nombre del perfil
          .populate("videos", "title"); // Mostrar solo el título del video
        if (!playlist) return res.status(404).json({ error: "Playlist no encontrada" });
        return res.json(playlist);
      }
  
      const playlists = await Playlist.find()
        .populate("profiles", "fullName")
        .populate("videos", "title");
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener playlists", details: error });
    }
  };

  const getPlaylistsByProfile = async (req, res) => {
    try {
      const { profileId } = req.query;
      if (!profileId) {
        return res.status(400).json({ error: "El ID del perfil es obligatorio" });
      }
  
      const playlists = await Playlist.find({ profiles: profileId })
        .populate("videos", "title videoUrl"); // Asegurar que también se incluya videoUrl
  
      res.json(playlists);
    } catch (error) {
      console.error("Error en getPlaylistsByProfile:", error);
      res.status(500).json({ error: "Error al obtener playlists del perfil", details: error.message });
    }
  };

  const getPlaylistById = async (req, res) => {
    try {
        const { playlistId } = req.query;
        if (!playlistId) {
            return res.status(400).json({ error: "El ID de la playlist es obligatorio" });
        }

        const playlist = await Playlist.findById(playlistId)
            .populate("videos", "title videoUrl");

        if (!playlist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }

        res.json(playlist);
    } catch (error) {
        console.error("Error en getPlaylistById:", error);
        res.status(500).json({ error: "Error al obtener la playlist", details: error.message });
    }
};

  
  
  
  // Crear una nueva playlist
  const createPlaylist = async (req, res) => {
    try {
      const { name, profiles } = req.body;
      if (!name || !profiles || !profiles.length) {
        return res.status(400).json({ error: "El nombre y los perfiles son obligatorios" });
      }
  
      // Verificar si los perfiles existen
      const validProfiles = await RestrictedUser.find({ _id: { $in: profiles } });
      if (validProfiles.length !== profiles.length) {
        return res.status(400).json({ error: "Uno o más perfiles no existen" });
      }
  
      const newPlaylist = new Playlist({ name, profiles });
      await newPlaylist.save();
      res.status(201).json(newPlaylist);
    } catch (error) {
      res.status(500).json({ error: "Error al crear la playlist", details: error });
    }
  };
  
  const playlistPatch = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, profiles, videos } = req.body;
  
      const playlist = await Playlist.findById(id);
      if (!playlist) return res.status(404).json({ error: "Playlist no encontrada" });
  
      // Actualizar solo los campos enviados en el body
      playlist.name = name || playlist.name;
      playlist.profiles = profiles?.length ? profiles : playlist.profiles;
      playlist.videos = videos?.length ? videos : playlist.videos;
  
      await playlist.save();
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la playlist", details: error.message });
    }
  };

  const deletePlaylist = async (req, res) => {
    try {
      const { id } = req.params;
      const playlist = await Playlist.findByIdAndDelete(id);
      if (!playlist) return res.status(404).json({ error: "Playlist no encontrada" });
  
      res.status(204).json({});
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar la playlist", details: error });
    }
  };
  

  module.exports = {getPlaylists, createPlaylist, playlistPatch, deletePlaylist, getPlaylistsByProfile, getPlaylistById };

