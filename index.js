const express = require('express');
require('dotenv').config();
const app = express();

// database connection
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://SAAJ:Stiven!2005@kidstube.4ndpo.mongodb.net/")
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// check for cors
const cors = require("cors");
const { userCreate, userGet, userDelete, userPatch, validateParentPin, verifyEmail, checkUserStatus, resendVerification, verifySmsCode } = require('./controllers/userController');
const { userLogin } = require('./controllers/userController');
const { videoCreate, videoGet, videoDelete, videoPatch } = require('./controllers/videoController');
const { createPlaylist, getPlaylists, deletePlaylist, playlistPatch, getPlaylistsByProfile, getPlaylistById } = require('./controllers/playlistController');
const { restrictedUserCreate, restrictedUserGet,
        restrictedUserDelete, restrictedUserPatch, restrictedUserLogin, restrictedUsersByParent } = require('./controllers/restUserController');
app.use(cors({
  origin: '*',
  methods: "*"
}));

app.post("/login", userLogin);
app.post("/users", userCreate);
app.get("/users", userGet); 
app.delete("/users/:id", userDelete); 
app.patch("/users/:id", userPatch);
app.post("/users/validate-pin", validateParentPin); 
app.post("/users/verify-email/:token", verifyEmail);
app.get("/users/check-status", checkUserStatus);
app.post("/users/resend-verification", resendVerification);
app.post("/users/verify-sms", verifySmsCode);

app.post("/videos", videoCreate);
app.get("/videos", videoGet);
app.delete("/videos/:id", videoDelete);
app.patch("/videos/:id", videoPatch);

app.post("/restrictedUsers", restrictedUserCreate);
app.get("/restrictedUsers", restrictedUserGet);
app.delete("/restrictedUsers/:id", restrictedUserDelete);
app.patch("/restrictedUsers/:id", restrictedUserPatch);
app.post("/restrictedUsers/login", restrictedUserLogin);
app.get("/restrictedUsers/by-parent/:parentAccount", restrictedUsersByParent);

app.post("/playlists", createPlaylist);
app.get("/playlists", getPlaylists);
app.delete("/playlists/:id", deletePlaylist);
app.patch("/playlists/:id", playlistPatch);
app.get("/playlists/by-profile", getPlaylistsByProfile);
app.get("/playlists/by-id", getPlaylistById);





app.listen(3000, () => {
  console.log("Server is running on port 3000");
});