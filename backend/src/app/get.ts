import path from 'path'
import consts from '../consts'
import {PDFParser, TextCell} from '../lib/PDFParser'

export default [{
    method: 'get',
    func: (req: any, res: any) => {
        if(!req?.query?.target)
            res.status(500).json({error: 'Target parameter not specified'})

        PDFParser.parse(
            path.join(consts.pdfRootDir, req?.query?.target + '.pdf'),
            (cells: TextCell[]) => res.json(JSON.stringify(cells)),
            (err: string) => res.status(500).json({error: err})
        )
    }
}]
