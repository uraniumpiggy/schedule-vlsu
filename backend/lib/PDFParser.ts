module.exports = (() => {
    const fs = require('fs')
    const pdf2json = require('pdf2json')

    class PDFParser {
        static parse(path: string, callback: (cells: TextCell[]) => void, error: (err: string) => void) {
            const parser = new pdf2json()

            parser.on("pdfParser_dataError", (errData: any) => error(errData.parserError))
            parser.on("pdfParser_dataReady", (pdfData: any) => {
                try {
                    const borders: Array<object> = PDFParser.getTextBordersCoordinates(pdfData, 0)
                    const cells: Array<TextCell> = PDFParser.defineCellsColor(pdfData, 0, PDFParser.getTextInCells(pdfData, 0, borders))
                    callback(cells)
                } catch(e: any) {
                    error(e.message)
                }
            })

            if(!fs.existsSync(path)) {
                error('Unknown institute name');
                return
            }

            parser.loadPDF(path)
        }

        //   {
        //     topLeft: { x: 74.419, y: 14.175 },
        //     rightBottom: { x: 91.251, y: 17.719 }
        //   },
        private static getTextBordersCoordinates(pdfData: any, numberOfPage: number): object[] {
            let result: object[] = []
            const linesData: any = pdfData["Pages"][numberOfPage]["VLines"]

            let xCoor:     number
            let yCoor:     number
            let l:         number
            let xCoorNext: number
            let yCoorNext: number
            let lNext:     number

            for (let i: number = 0; i < linesData.length; i+=2) {
                xCoor     = linesData[i]["x"]
                yCoor     = linesData[i]["y"]
                l         = linesData[i]["l"]
                xCoorNext = linesData[i+1]["x"]
                yCoorNext = linesData[i+1]["y"]
                lNext     = linesData[i+1]["l"]

                if (l === lNext && yCoor === yCoorNext) {
                    const item: object = {
                        topLeft: {
                            x: xCoorNext,
                            y: yCoorNext,
                        },
                        rightBottom: {
                            x: xCoor,
                            y: yCoor + l,
                        }
                    }

                    result.push(item)
                } else
                    throw new Error("Error occured")
            }

            return result
        }


        //   text: 'c 31.01.2022 по 08.06.2022',
        //   isYellow: false,
        //   borders: {
        //     topLeft: { x: 40.753, y: 17.719 },
        //     rightBottom: { x: 57.586, y: 19.491 }
        //   }
        private static getTextInCells(pdfData: any, numberOfPage: number, borders: any[]): TextCell[] {
            const textData:  any = pdfData["Pages"][numberOfPage]["Texts"]
            let currentText: string
            let textX:       number
            let textY:       number

            let result: TextCell[] = []

            for (let bordersIndex: number = 0; bordersIndex < borders.length; bordersIndex++) {
                let textCellItem = new TextCell("", borders[bordersIndex])

                for (let i: number = 0; i < textData.length; i++) {
                    currentText = decodeURIComponent(textData[i]["R"][0]["T"])
                    textX       = textData[i]["x"]
                    textY       = textData[i]["y"]

                    if (borders[bordersIndex].topLeft.x < textX &&
                        borders[bordersIndex].rightBottom.x > textX &&
                        borders[bordersIndex].topLeft.y < textY &&
                        borders[bordersIndex].rightBottom.y > textY)
                    {
                        textCellItem.text += currentText + " "
                    }
                }
                result.push(textCellItem)
            }

            return result
        }

        private static defineCellsColor(pdfData: any, numberOfPage: number, cells: Array<TextCell>): Array<TextCell> {
            const colorsData:     any = pdfData["Pages"][numberOfPage]["Fills"]
            let rectTopLeftX:     number
            let rectTopLeftY:     number
            let rectRightBottomX: number
            let rectRightBottomY: number
            let rectColor:        string

            for (let i: number = 0; i < colorsData.length; i++) {
                rectTopLeftX     = colorsData[i]["x"]
                rectTopLeftY     = colorsData[i]["y"]
                rectRightBottomX = colorsData[i]["w"] + rectTopLeftX
                rectRightBottomY = colorsData[i]["h"] + rectTopLeftY
                rectColor        = colorsData[i]["oc"]

                for (let cellIndex: number = 0; cellIndex < cells.length; cellIndex++) {
                    if (rectColor === "#ffff00") {
                        if (
                            Math.abs(cells[cellIndex].borders.topLeft.x - rectTopLeftX) < 0.1 &&
                            Math.abs(cells[cellIndex].borders.topLeft.y - rectTopLeftY) < 0.1 &&
                            Math.abs(cells[cellIndex].borders.rightBottom.x - rectRightBottomX) < 0.1 &&
                            Math.abs(cells[cellIndex].borders.rightBottom.y - rectRightBottomY) < 0.1
                        )
                        {
                            cells[cellIndex].isYellow = true
                        }
                    }
                }
            }

            return cells
        }
    }

    class TextCell {
        text: string
        isYellow: boolean
        readonly borders: any

        constructor(text: string, borders: any) {
            this.text = text
            this.isYellow = false
            this.borders = borders
        }
    }

    return {
        PDFParser,
        TextCell
    }
})()
