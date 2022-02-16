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
    teacher: String,
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

const groupScheduleSchema = new mongoose.Schema({
    group: String,
    term: String,
    lessons: [lessonCellSchema]
})

groupScheduleSchema.statics.findByNameOfGroup = function(nameOfGroup) {
    return this.findOne({name: new RegExp(nameOfGroup, "i")})
} 

module.exports = mongoose.model("GroupSchedule", groupScheduleSchema)