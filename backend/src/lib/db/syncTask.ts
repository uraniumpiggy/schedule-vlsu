import fs from 'fs'
import path from 'path'
import consts from '../../consts'

import { PDFParser } from '../PDFParser'
import { DBController } from './controller'

export async function updateDatabase() {
    const controller = new DBController(consts.dbURL, 'root', 'example', 'admin')
    const teachersNames: any = []
    const groupsNames: any = []
    const groupsSchedule: any = []

    fs.readdirSync(consts.pdfRootDir).map((fileName: string) => {
        PDFParser.parse(
            path.join(consts.pdfRootDir, fileName),
            (cells: any) => {
                teachersNames.push(...cells.teachersNames.teachers)
                groupsNames.push(...cells.groupsNames.groups)
                groupsSchedule.push(...cells.groupsSchedule)
            },
            (err: string) => console.log(err)
        )
    })

    await updateAudiences(groupsSchedule, controller)
    await updateGroups(groupsNames, controller)
    await updateTeachers(teachersNames, controller)
}

export async function updateAudiences(data: any, controller: DBController) {
    for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].lessons.length; j++) {
            for(let z = 0; z < data[i].lessons[j].lesson.length; z++) {
                const lesson = data[i].lessons[j].lesson[z]
                const itemData = {cabinet: lesson.audienceNumber, universityBuilding: lesson.universityBuilding}
                const item = await controller.AudienceModel.findOne(itemData)

                if(!item && itemData.cabinet !== '')
                    await controller.AudienceModel.create(itemData)
            }
        }
    }
}

export async function updateGroups(data: any, controller: DBController) {
    for(let i = 0; i < data.length; i++) {
        const item = await controller.GroupModel.findOne({name: data[i]})
        if(!item)
            await controller.GroupModel.create({name: data[i]})
    }

    const items = await controller.GroupModel.find()
    items.forEach((item: any) => {
        if(!data.includes(item.name))
            item.remove()
    })
}

export async function updateTeachers(data: any, controller: DBController) {
    for(let i = 0; i < data.length; i++) {
        const item = await controller.TeachersModel.findOne({fullName: data[i]})
        if(!item)
            await controller.TeachersModel.create({fullName: data[i]})
    }

    const items = await controller.TeachersModel.find()
    items.forEach((item: any) => {
        if(!data.includes(item.fullName))
            item.remove()
    })
}
