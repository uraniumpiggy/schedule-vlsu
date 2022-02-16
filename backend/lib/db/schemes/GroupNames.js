const mongoose = require('mongoose')

const groupNamesSchema = new mongoose.Schema({
    groups: {
        type: [String],
        default: []
    }
})

module.exports = mongoose.model("GroupNames", groupNamesSchema)