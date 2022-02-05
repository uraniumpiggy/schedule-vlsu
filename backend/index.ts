import fs from 'fs'
import cron from 'node-cron'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import express from 'express'
import consts from './consts'

const app = express()
const port = 3000

const appRootDir = consts.appRootDir
const pdfRootDir = consts.pdfRootDir
const vlsuURL= consts.vlsuURL
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

function parseSite(rootDir: string) {
    axios.get(vlsuURL).then((response: any) => {
        const dom = new JSDOM(response.data)
        fs.rmdirSync(rootDir, {recursive: true})
        fs.mkdirSync(rootDir)

        dom.window.document.querySelectorAll('a').forEach((link: any) => {
            if (link.href.includes(".pdf")) {
                const writer = fs.createWriteStream(rootDir + '/' + link.text)

                axios({
                    url: link.href,
                    responseType: 'stream'
                }).then((response: any) => {
                    response.data.pipe(writer)

                    writer.on('error', err => {
                        console.error(err)
                        writer.close()
                    })
                })
            }
        })
    }).catch((err: any) => console.error(err))
}

parseSite(pdfRootDir)

fs.readdirSync(appRootDir).map(async (fileName: string) => {
    const components = fileName.split('.')

    if(components[1] == 'js')
        return

    const routesInfo = (await import('./app/' + components[0])).default
    routesInfo.forEach((info: any) => (app as any)[info.method]('/' + components[0], info.func))
})

app.listen(port, () => console.log('Server start in port: ' + port))

cron.schedule("0 0 0-23 * * *", () => {
    console.log("Updating PDF start")
    parseSite(pdfRootDir)
    console.log("Updating PDF end")
});
