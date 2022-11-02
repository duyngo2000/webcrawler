const mongoose = require("mongoose");

const inforSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true,
    indexes: 1,
  },
  name: {
    type: String,
    required: true,
    index: 1,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
    default: "City undefined",

    required: true,
  },
  country: {
    type: String,
    default: "Country undefined",
    required: true,
  },
  teleNumber: {
    type: String,
    default: "Telenumber undefined",
    required: true,
  },
  domain: {
    type: String,
    index: 1,
  },
  logo: {
    type: String,
  },
  verify: {
    type: Boolean,
  },
  subDomain: {
    type: String,
  },
  taxCode: {
    type: String,
    default: "Tax code undefined",
    required: true,
  },
  extensionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "extension",
  },
});

module.exports = mongoose.model("inforWebsite", inforSchema);
