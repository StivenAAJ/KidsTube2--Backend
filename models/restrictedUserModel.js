const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restrictedUser = new Schema({

    fullName: { type: String, required: true },
    pin: { type: String, required: true, minlength: 6, maxlength: 6 },
    avatar: { type: String, required: true }, // URL o nombre de imagen
    parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

});


module.exports = mongoose.model("RestrictedUser", restrictedUser);