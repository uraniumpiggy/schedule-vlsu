import fs from 'fs'
const pdf2json = require('pdf2json')

export class PDFParser {
    static parse(path: string, callback: (cells: TextCell[]) => void, error: (err: string) => void) {
        const parser = new pdf2json()

        parser.on("pdfParser_dataError", (errData: any) => error(errData.parserError))
        parser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                const borders: object[] = PDFParser.getTextBordersCoordinates(pdfData, 0)
                const cells: TextCell[] = PDFParser.defineCellsColor(pdfData, 0, PDFParser.getTextInCells(pdfData, 0, borders))
                const verticalCoors: VerticalSections = new VerticalSections(cells)
                for (const cell of cells) {
                    if (cell.text === "МКН-121") {
                        // console.log(JSON.stringify(this.getGroupSchedule(cell, cells, verticalCoors)))
                        fs.writeFile("output.json", JSON.stringify(this.getGroupSchedule(cell, cells, verticalCoors)), 'utf8', function (err) {
                            if (err) {
                                console.log("An error occured while writing JSON Object to File.");
                                return console.log(err);
                            }
                         
                            console.log("JSON file has been saved.");
                        });
                    }
                }
                callback(cells)
            } catch(e: any) {
                error(e.message)
            }
        })

        if(!fs.existsSync(path)) {
            error('Unknown institute name')
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

        for (let i: number = 0; i < linesData.length; i+=2) {
            const xCoor: number = linesData[i]["x"]
            const yCoor: number = linesData[i]["y"]
            const l: number = linesData[i]["l"]
            const xCoorNext: number = linesData[i+1]["x"]
            const yCoorNext: number= linesData[i+1]["y"]
            const lNext: number= linesData[i+1]["l"]

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
        let result: TextCell[] = []

        for (let bordersIndex: number = 0; bordersIndex < borders.length; bordersIndex++) {
            let textCellItem = new TextCell("", borders[bordersIndex])

            for (let i: number = 0; i < textData.length; i++) {
                const currentText: string = decodeURIComponent(textData[i]["R"][0]["T"])
                const textX: number = textData[i]["x"]
                const textY: number = textData[i]["y"]

                if (borders[bordersIndex].topLeft.x < textX &&
                    borders[bordersIndex].rightBottom.x > textX &&
                    borders[bordersIndex].topLeft.y < textY &&
                    borders[bordersIndex].rightBottom.y > textY)
                {
                    textCellItem.text += currentText + " "
                }
            }

            textCellItem.text = textCellItem.text.trim();
            if (textCellItem.text !== "") {
                result.push(textCellItem)
            }
        }

        return result
    }

    private static defineCellsColor(pdfData: any, numberOfPage: number, cells: Array<TextCell>): Array<TextCell> {
        const colorsData:     any = pdfData["Pages"][numberOfPage]["Fills"]

        for (let i: number = 0; i < colorsData.length; i++) {
            const rectTopLeftX : number = colorsData[i]["x"]
            const rectTopLeftY : number = colorsData[i]["y"]
            const rectRightBottomX : number = colorsData[i]["w"] + rectTopLeftX
            const rectRightBottomY : number = colorsData[i]["h"] + rectTopLeftY
            const rectColor : string = colorsData[i]["oc"]

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

     // необходимо тщательное тестирование
    private static parseLessonString(lessonString: string): object[] {
        const timeLimitRegExp: RegExp   = /с\s\d+\sнед\.\sпо\s\d+\sнед\./;
        const cabinetRegExp: RegExp     = /\s((\d+[а-я]?)|([А-Я]))-\d+/;
        const lessonTypeRegExp: RegExp  = /\s(лк|лб|пр)\s/;
        const teacherRegExp: RegExp     = /\s[А-Я][а-я]+\s[А-Я]\.\s?[А-Я]\./;
        const endOfLessonRegExp: RegExp = /[а-яА-Я]+\.($|(\s[А-Я]))/g;
        let res: object[] = [];

        let lessonStringCopy: string = lessonString;

        const lessonStringArray: RegExpMatchArray = lessonStringCopy.match(endOfLessonRegExp) ?? [];
        if (lessonStringArray === []) {
            console.log("Cant define end of string", lessonStringCopy);
        }

        const lessonCounter: number = lessonStringCopy.match(endOfLessonRegExp)?.length ?? 1;

        for (let i: number = 0; i < lessonCounter; i++) {
            let currentLessonText: string;
            // console.log(lessonStringArray)
            if (lessonStringArray === []) {
                currentLessonText = lessonStringCopy;
            } else {
                if (i < lessonCounter - 1) {
                    currentLessonText = lessonStringCopy.substring(0, lessonStringCopy.indexOf(lessonStringArray[i]) + lessonStringArray[i].length - 2);
                    lessonStringCopy = lessonStringCopy.replace(currentLessonText + " ", "");
                } else {
                    currentLessonText = lessonStringCopy;
                }
            }

            // время проведения пары, этот тескт убирать из текста пары не стоит
            const timeOfLesson: RegExpMatchArray = currentLessonText.match(timeLimitRegExp) ?? [];
            let timeStart: number = 0;
            let timeEnd: number   = -1;
            if (timeOfLesson.length !== 0) {
                const timeStratEndArray: RegExpMatchArray[] = [...timeOfLesson[0].matchAll(/\d+/g)];
                if (timeStratEndArray.length === 0) {
                    throw "Unexpected error in regex parsing" + currentLessonText;
                }
                timeStart = parseInt(timeStratEndArray[0][0]);
                timeEnd = parseInt(timeStratEndArray[1][0]);
            }

            const cabinetArray: RegExpMatchArray = currentLessonText.match(cabinetRegExp) ?? [];
            let cabinet: string = "";
            if (cabinetArray.length === 0) {
                console.log("Bad cabinet parsing", currentLessonText);
            } else {
                cabinet = cabinetArray[0].trim();
            }
            currentLessonText = currentLessonText.replace(cabinetRegExp, "");

            const lessonTypeArray: RegExpMatchArray = currentLessonText.match(lessonTypeRegExp) ?? [];
            let lessonType: string = "";
            if (lessonTypeArray.length === 0) {
                console.log("Bad lesson parsing", currentLessonText);
            } else {
                lessonType = lessonTypeArray[0].trim();
            }
            currentLessonText = currentLessonText.replace(lessonType, "");

            const teacherArray: RegExpMatchArray = currentLessonText.match(teacherRegExp) ?? [];
            let techer: string = "";
            if (teacherArray.length === 0) {
                console.log("Bad teacher parsing", currentLessonText);
            } else {
                techer = teacherArray[0].trim();
            }
            currentLessonText = currentLessonText.replace(techer, "");
            currentLessonText = currentLessonText.replace("  ", " ");

            const currnetRes: object = {
                timeStart: timeStart,
                timeEnd: timeEnd,
                cabinet: cabinet,
                lessonType: lessonType,
                techer: techer,
                lesson: currentLessonText.trim(),
            }

            res.push(currnetRes);
        }

        return res;
    }

    private static getGroupSchedule(group: TextCell, cells: Array<TextCell>, coorTimeMap: VerticalSections): object {
        let lessons: Array<object> = []
        let term: string = ""
        const termCoors: Array<number> = coorTimeMap.getTermCoors() 
    
        for (const cell of cells) {
            const leftBordersMatchUp: boolean = Math.abs(group.borders.topLeft.x - cell.borders.topLeft.x) < 1
            const rightBordersMatchUp: boolean = Math.abs(group.borders.rightBottom.x - cell.borders.rightBottom.x) < 1
            if (leftBordersMatchUp && rightBordersMatchUp ||
                leftBordersMatchUp && group.borders.rightBottom.x < cell.borders.rightBottom.x ||
                group.borders.topLeft.x > cell.borders.topLeft.x && rightBordersMatchUp) 
            {
                const dayTime: Array<string> | undefined = coorTimeMap.getDayTime(cell.borders.topLeft.y, cell.borders.rightBottom.y)
                let subgroup: string = ""
                if (leftBordersMatchUp && cell.borders.rightBottom.x < group.borders.rightBottom.x - 2) {
                    subgroup = "1 п/г"
                }
                if (rightBordersMatchUp && group.borders.topLeft.x + 2 < cell.borders.topLeft.x) {
                    subgroup = "2 п/г"
                }
                if (Math.abs(termCoors[0] - cell.borders.topLeft.y) < 1 && Math.abs(termCoors[1] - cell.borders.rightBottom.y) < 1) {
                    term = cell.text
                }
                if (dayTime !== undefined) {
                    const lesson: object = {
                        lesson: PDFParser.parseLessonString(cell.text),
                        day: dayTime[0],
                        time: dayTime[1],
                        week: cell.isYellow ? 0 : 1,
                        subgroup: subgroup
                    }
                    lessons.push(lesson)
                }
            }
        }
    
        return {
            group: group.text,
            term: term,
            lessons: lessons
        }
    }
}

export class TextCell {
    text: string
    isYellow: boolean
    readonly borders: any

    constructor(text: string, borders: any) {
        this.text = text
        this.isYellow = false
        this.borders = borders
    }
}

// coors -> day/time
class VerticalSections {
    readonly coorTimeMap: Map<Array<number>, Array<string>>
    private groupCoors: Array<number> = [0,0]
    private termCoors: Array<number> = [0,0]

    constructor(cells: Array<TextCell>) {
        let coorTimeMap: Map<Array<number>, Array<string>> = new Map<Array<number>, Array<string>>()
        let currentDay: string = ""
        const timeOfLessonRegExp: RegExp = /^\d+\:\d+/ 
        for (const cell of cells) {
            if (cell.text === "Понедельник" || cell.text === "Вторник" || cell.text === "Среда" || cell.text === "Четверг" || cell.text === "Пятница" || cell.text === "Суббота") {
                currentDay = cell.text
            }
            if (timeOfLessonRegExp.test(cell.text)) {
                console.log(cell.text)
                coorTimeMap.set([cell.borders.topLeft.y, cell.borders.rightBottom.y], [currentDay, cell.text]);
            }
            if (cell.text === "Группа") {
                this.groupCoors = [cell.borders.topLeft.y, cell.borders.rightBottom.y]
            }
            if (cell.text === "Срок") {
                this.termCoors = [cell.borders.topLeft.y, cell.borders.rightBottom.y]
            }
        } 
        this.coorTimeMap = coorTimeMap
    }

    getDayTime(yStart: number, yEnd: number): Array<string>|undefined {
        for (let key of this.coorTimeMap.keys()) {
            if (Math.abs(key[0] - yStart) < 1 && Math.abs(key[1] - yEnd) < 1 ||
                Math.abs(key[0] - yStart) < 1 && key[1] > yEnd ||
                key[0] > yStart && Math.abs(key[1] - yEnd) < 1) 
            {
                return this.coorTimeMap.get(key)
            }
        }
        return [];
    }

    getGroopsCoor(): Array<number> {
        return this.groupCoors
    }

    getTermCoors(): Array<number> {
        return this.termCoors
    }
}


PDFParser.parse("../1.pdf", () => {}, () => {})