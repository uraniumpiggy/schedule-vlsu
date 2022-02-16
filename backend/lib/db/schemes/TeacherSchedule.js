const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
    timeStart: {
        type: Number,
        min: 0,
        max: 20
    },
    timeEnd: {
        type: Number,
        min: -1,
        max: 20
    },
    cabinet: String,
    lessonType: String,
    group: String,
    lessonName: String,
})

const lessonCellSchema = new mongoose.Schema({
    lesson: [lessonSchema],
    day: String,
    time: String,
    week: {
        type: Number,
        min: 0,
        max: 1
    },
    subgroup: String,
})

const teacherScheduleSchema = new mongoose.Schema({
    teacher: String,
    term: String,
    lessons: [lessonCellSchema]
})

teacherScheduleSchema.statics.findByNameOfTeacher = function(teacher) {
    return this.findOne({teacher: new RegExp(teacher, "i")})
} 

module.exports = mongoose.model("TeacherSchedule", teacherScheduleSchema)