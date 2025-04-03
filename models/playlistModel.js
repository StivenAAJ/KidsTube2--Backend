const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlist = new Schema({

    name: { type: String, required: true },
    profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "RestrictedUser", required: true }], 
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "videos" }]
});


module.exports = mongoose.model("playlists", playlist);