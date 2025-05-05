const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema({
  /*email:        {type: String, required: true},
  password:     {type: String, required: true},
  number:       {type: String, required: true},
  pin:          {type: Number, required: true},
  first_name:   {type: String, required: true},
  last_name:    {type: String, required: true},
  country:      {type: String},
  birthday:     {type: Date, required: true},
  status:       {type: String, enum: ['pending', 'active'], default: 'pending'},
  verificationToken: {type: String},
  smsVerificationCode: { type: String },
  smsVerificationExpires: { type: Date }*/

    email: { type: String, required: true },
    password: { type: String, required: function () { return !this.isGoogleUser; } }, // No requerido para usuarios de Google
    number: { type: String, required: function () { return !this.isGoogleUser; } }, // No requerido para usuarios de Google
    pin: { type: Number, required: function () { return !this.isGoogleUser; } }, // No requerido para usuarios de Google
    first_name: { type: String, required: true },
    last_name: { type: String, required: function () { return !this.isGoogleUser; } }, // No requerido para usuarios de Google
    country: { type: String },
    birthday: { type: Date, required: function () { return !this.isGoogleUser; } }, // No requerido para usuarios de Google
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    verificationToken: { type: String },
    smsVerificationCode: { type: String },
    smsVerificationExpires: { type: Date },
    isGoogleUser: { type: Boolean, default: false }, // Indica si el usuario se registró con Google
});

module.exports = mongoose.model("users", user);