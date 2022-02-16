const mongoose = require("mongoose")

const teacherNamesSchema = new mongoose.Schema({
    teachers: {
        type: [String],
        default: []
    }
})

module.exports = mongoose.model("TeacherNames", teacherNamesSchema)