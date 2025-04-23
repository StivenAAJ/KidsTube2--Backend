const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema({
  email:        {type: String, required: true},
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
  smsVerificationExpires: { type: Date }
});

module.exports = mongoose.model("users", user);