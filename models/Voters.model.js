const mongoose = require('mongoose');

const voterschema = new mongoose.Schema({
  user: { type: String, required: true },
  votes: { type: Array, required: true },
});

module.exports = mongoose.model('Voter', voterschema);
