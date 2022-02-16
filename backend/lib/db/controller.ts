const TeacherNames = require("./schemes/TeacherNames")
const GroupNames = require("./schemes/GroupNames")
const GroupSchedule = require("./schemes/GroupSchedule")
const TeacherSchedule = require("./schemes/TeacherSchedule")
const mongoose = require("mongoose")
import consts from '../../consts'


export class DBController {
    private readonly URL: string

    constructor(URL: string = consts.dbURL) {
        this.URL = URL

        mongoose.connect(
            URL,
            () => console.log("Connected"),
            (e: any) => console.log(e),
        )
    }

    public async getGroupScheduleByName(nameOfGroup: string): Promise<object> {
        const schedule: object[] = await GroupSchedule.findByNameOfGroup(nameOfGroup)
        return schedule[0]
    }

    public async getTeacherScheduleByName(teacherName: string): Promise<object> {
        const schedule: object[] = await TeacherSchedule.findByNameOfTeacher(teacherName)
        return schedule[0]
    }

    public async getGroupNames(): Promise<object> {
        const names: object[] = await GroupNames.find({})
        return names[0]
    }

    public async getTeacherNames(): Promise<object> {
        const names: object[] = await TeacherNames.find({})
        return names[0]
    }



    public async insertGroupSchedule(schedule: any[]) {
        await GroupSchedule.insertMany(schedule)
        console.log("Group schedule saved")
    }

    public async insertTeacherSchedule(schedule: any[]) {
        await TeacherSchedule.insertMany(schedule)
        console.log('Teachers schedule saved')
    }

    public async addToGroupNames(names: string[]) {
        const groupNames = await GroupNames.find({})
        groupNames[0].groups.push(...names)
        await groupNames.save()
    }

    public async addToTeacherNames(names: string[]) {
        const teacherNames = await TeacherNames.find({})
        teacherNames[0].teachers.push(...names)
        await teacherNames.save()
    }



    public async deleteAllGroupSchedules() {
        await GroupSchedule.remove({})
    }

    public async deleteAllTeacherSchedules() {
        await TeacherSchedule.remove({})
    }

    public async deleteAllGroupNames() {
        await GroupNames.remove({})
    }

    public async deleteAllTeacherNames() {
        await TeacherNames.remove({})
    }
}