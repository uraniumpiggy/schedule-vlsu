import { resourceLimits } from "worker_threads";

const fs        = require('fs');
const PDFParser = require('pdf2json');

//   {
//     topLeft: { x: 74.419, y: 14.175 },
//     rightBottom: { x: 91.251, y: 17.719 }
//   },
function getTextBordersCoordinates(pdfData: any, numberOfPage: number): Array<object> {
    let result: Array<object> = [];
    const linesData: any = pdfData["Pages"][numberOfPage]["VLines"];

    let xCoor:     number;
    let yCoor:     number;
    let l:         number;
    let xCoorNext: number;
    let yCoorNext: number;
    let lNext:     number;

    for (let i: number = 0; i < linesData.length; i+=2) {
        xCoor     = linesData[i]["x"];
        yCoor     = linesData[i]["y"];
        l         = linesData[i]["l"];
        xCoorNext = linesData[i+1]["x"];
        yCoorNext = linesData[i+1]["y"];
        lNext     = linesData[i+1]["l"];

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
            };
            
            result.push(item);
        } else {
            console.log("Error occured");
            result.push({})
        }
    }

    return result;
}

class TextCell {
    text: string;
    isYellow: boolean;
    readonly borders: any;

    constructor(text: string, borders: any) {
        this.text = text;
        this.isYellow = false;
        this.borders = borders;
    }
}

//   text: 'c 31.01.2022 по 08.06.2022',
//   isYellow: false,
//   borders: {
//     topLeft: { x: 40.753, y: 17.719 },
//     rightBottom: { x: 57.586, y: 19.491 }
//   }
function getTextInCells(pdfData: any, numberOfPage: number, borders: Array<any>): Array<TextCell> {
    const textData:  any = pdfData["Pages"][numberOfPage]["Texts"];
    let currentText: string;
    let textX:       number;
    let textY:       number;

    let result: Array<TextCell> = [];


    for (let bordersIndex: number = 0; bordersIndex < borders.length; bordersIndex++) {

        let textCellItem = new TextCell("", borders[bordersIndex]);

        for (let i: number = 0; i < textData.length; i++) {
            currentText = decodeURIComponent(textData[i]["R"][0]["T"]);
            textX       = textData[i]["x"];
            textY       = textData[i]["y"];
                
            if (borders[bordersIndex].topLeft.x < textX && 
                borders[bordersIndex].rightBottom.x > textX &&
                borders[bordersIndex].topLeft.y < textY &&
                borders[bordersIndex].rightBottom.y > textY)
            {
                textCellItem.text += currentText + " ";
            }
        }
        textCellItem.text = textCellItem.text.trim();
        if (textCellItem.text !== "") {
            result.push(textCellItem);
        }
    }

    return result;
}

function defineCellsColor(pdfData: any, numberOfPage: number, cells: Array<TextCell>): Array<TextCell> {
    const colorsData:     any = pdfData["Pages"][numberOfPage]["Fills"];
    let rectTopLeftX:     number;
    let rectTopLeftY:     number;
    let rectRightBottomX: number;
    let rectRightBottomY: number;
    let rectColor:        string;

    for (let i: number = 0; i < colorsData.length; i++) {
        rectTopLeftX     = colorsData[i]["x"];
        rectTopLeftY     = colorsData[i]["y"];
        rectRightBottomX = colorsData[i]["w"] + rectTopLeftX;
        rectRightBottomY = colorsData[i]["h"] + rectTopLeftY;
        rectColor        = colorsData[i]["oc"];

        for (let cellIndex: number = 0; cellIndex < cells.length; cellIndex++) {
            if (rectColor === "#ffff00") {
                if (Math.abs(cells[cellIndex].borders.topLeft.x - rectTopLeftX) < 0.1 &&
                    Math.abs(cells[cellIndex].borders.topLeft.y - rectTopLeftY) < 0.1 &&
                    Math.abs(cells[cellIndex].borders.rightBottom.x - rectRightBottomX) < 0.1 &&
                    Math.abs(cells[cellIndex].borders.rightBottom.y - rectRightBottomY) < 0.1) 
                {
                    cells[cellIndex].isYellow = true;
                }
            }
        }
    }

    return cells;
}

// необходимо тщательное тестирование
function parseLessonString(lessonString: string): object[] {
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

// coors -> day/time
class LessonTimings {
    readonly coorTimeMap: Map<Array<number>, Array<string>>

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
        } 
        this.coorTimeMap = coorTimeMap
    }

    getDayTime(yStart: number, yEnd: number): Array<string>|undefined {
        for (let key of this.coorTimeMap.keys()) {
            if (Math.abs(key[0] - yStart) < 1 && Math.abs(key[1] - yEnd) < 1 ||
                Math.abs(key[0] - yStart) < 1 && yEnd < key[1] ||
                yStart > key[0] && Math.abs(key[1] - yEnd) < 1) 
            {
                return this.coorTimeMap.get(key)
            }
        }
        return [];
    }
}

function getGroupSchedule(group: TextCell, cells: Array<TextCell>, coorTimeMap: LessonTimings): Array<object> {
    let result: Array<object> = []

    for (const cell of cells) {
        if (Math.abs(group.borders.topLeft.x - cell.borders.topLeft.x) < 1 && Math.abs(group.borders.rightBottom.x - cell.borders.rightBottom.x) < 1 ||
            Math.abs(group.borders.topLeft.x - cell.borders.topLeft.x) < 1 && Math.abs(group.borders.rightBottom.x - cell.borders.rightBottom.x) > 1 ||
            Math.abs(group.borders.topLeft.x - cell.borders.topLeft.x) > 1 && Math.abs(group.borders.rightBottom.x - cell.borders.rightBottom.x) < 1) 
        {
            const dayTime: Array<string> | undefined = coorTimeMap.getDayTime(cell.borders.topLeft.y, cell.borders.rightBottom.y)
            if (dayTime !== undefined) {
                const lesson: object = {
                    lesson: parseLessonString(cell.text),
                    day: dayTime[0],
                    time: dayTime[1],
                    week: cell.isYellow ? 1 : 0
                }
                result.push(lesson)
            }
        }
    }

    return result
}

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", (errData: any) => {console.error(errData.parserError)} );

pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
    fs.writeFile("./res.json", decodeURIComponent(JSON.stringify(pdfData)), (response: any) => {
        const borders: Array<object> = getTextBordersCoordinates(pdfData, 0);
        let cells: Array<TextCell>   = getTextInCells(pdfData, 0, borders);
        cells                        = defineCellsColor(pdfData, 0, cells);
        const coorTimeMap: LessonTimings = new LessonTimings(cells)
        for (let i: number = 0; i < cells.length; i++) {
            if (cells[i].text === "АИС-121") {
                const schedule: Array<object> = getGroupSchedule(cells[i], cells, coorTimeMap)
                for (let val of schedule) {
                    console.log(val)
                }
            }
            // console.log(cells[i])
        }
        console.log(coorTimeMap)
    })
});

pdfParser.loadPDF('./1.pdf');