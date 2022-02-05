module.exports = () => {
    const fs = require('fs')
    const path = require('path')
    const pdfParser = require('../lib/PDFParser')
    const pdfRootDir = path.join(__dirname, '../institutesTimetables')

    return {
        method: 'get',
        func: (req: any, res: any) => {
            if(!req?.query?.target)
                res.status(500).json({error: 'Target parameter not specified'})

            pdfParser.PDFParser.parse(
                path.join(pdfRootDir, req?.query?.target + '.pdf'),
                (cells: any) => res.json(JSON.stringify(cells)),
                (err: string) => res.status(500).json({error: err})
            )
        }
    }
}
