import fs from 'fs'
import path from 'path'
import consts from '../../consts'

import { PDFParser } from '../PDFParser'
import { DBController } from './controller'

export function updateDatabase() {
    const controller = new DBController(consts.dbURL, 'root', 'example', 'admin')

    fs.readdirSync(consts.pdfRootDir).map((fileName: string) => {
        PDFParser.parse(
            path.join(consts.pdfRootDir, fileName),
            (cells: any) => {
                insertAudience(cells.groupsSchedule, controller)
                insertGroup(cells.groupsNames, controller)
            },
            (err: string) => console.log(err)
        )
    })
}

export async function insertAudience(data: any, controller: DBController) {
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

export async function insertGroup(data: any, controller: DBController) {
    for(let i = 0; i < data.groups.length; i++) {
        const itemData = {name: data.groups[i]}
        const item = await controller.GroupModel.findOne(itemData)

        if(!item)
            await controller.GroupModel.create(itemData)
    }
}
