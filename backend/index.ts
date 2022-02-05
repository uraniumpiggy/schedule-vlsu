const fs = require('fs')
const path = require('path')

const express = require('express')
const app = express()
const port = 3000

const appRootPath = path.join(__dirname, './app')

fs.readdirSync(appRootPath).map((fileName: string) => {
    const components = fileName.split('.')

    if(components[1] == 'js')
        return

    const routeInfo = require('./app/' + components[0])()
    console.log(routeInfo.method, components[0])
    app[routeInfo.method]('/' + components[0], routeInfo.func)
})

app.listen(port, () => console.log('Server start in port: ' + port))
