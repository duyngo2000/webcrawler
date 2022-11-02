const mongoose = require("mongoose");
const extensionSchema = new mongoose.Schema({
    alive: {
        type: Boolean,
        require: true,
    },
    email: [],
    hotline: [],
})
module.exports = mongoose.model("extension", extensionSchema);
