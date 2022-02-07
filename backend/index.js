"use strict";
const fs = require('fs');
const PDFParser = require('pdf2json');
//   {
//     topLeft: { x: 74.419, y: 14.175 },
//     rightBottom: { x: 91.251, y: 17.719 }
//   },
function getTextBordersCoordinates(pdfData, numberOfPage) {
    let result = [];
    const linesData = pdfData["Pages"][numberOfPage]["VLines"];
    let xCoor;
    let yCoor;
    let l;
    let xCoorNext;
    let yCoorNext;
    let lNext;
    for (let i = 0; i < linesData.length; i += 2) {
        xCoor = linesData[i]["x"];
        yCoor = linesData[i]["y"];
        l = linesData[i]["l"];
        xCoorNext = linesData[i + 1]["x"];
        yCoorNext = linesData[i + 1]["y"];
        lNext = linesData[i + 1]["l"];
        if (l === lNext && yCoor === yCoorNext) {
            const item = {
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
        }
        else {
            console.log("Error occured");
            result.push({});
        }
    }
    return result;
}
class TextCell {
    constructor(text, borders) {
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
function getTextInCells(pdfData, numberOfPage, borders) {
    const textData = pdfData["Pages"][numberOfPage]["Texts"];
    let currentText;
    let textX;
    let textY;
    let result = [];
    for (let bordersIndex = 0; bordersIndex < borders.length; bordersIndex++) {
        let textCellItem = new TextCell("", borders[bordersIndex]);
        for (let i = 0; i < textData.length; i++) {
            currentText = decodeURIComponent(textData[i]["R"][0]["T"]);
            textX = textData[i]["x"];
            textY = textData[i]["y"];
            if (borders[bordersIndex].topLeft.x < textX &&
                borders[bordersIndex].rightBottom.x > textX &&
                borders[bordersIndex].topLeft.y < textY &&
                borders[bordersIndex].rightBottom.y > textY) {
                textCellItem.text += currentText + " ";
            }
        }
        textCellItem.text.slice(0, -1);
        result.push(textCellItem);
    }
    return result;
}
function defineCellsColor(pdfData, numberOfPage, cells) {
    const colorsData = pdfData["Pages"][numberOfPage]["Fills"];
    let rectTopLeftX;
    let rectTopLeftY;
    let rectRightBottomX;
    let rectRightBottomY;
    let rectColor;
    for (let i = 0; i < colorsData.length; i++) {
        rectTopLeftX = colorsData[i]["x"];
        rectTopLeftY = colorsData[i]["y"];
        rectRightBottomX = colorsData[i]["w"] + rectTopLeftX;
        rectRightBottomY = colorsData[i]["h"] + rectTopLeftY;
        rectColor = colorsData[i]["oc"];
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
            if (rectColor === "#ffff00") {
                if (Math.abs(cells[cellIndex].borders.topLeft.x - rectTopLeftX) < 0.1 &&
                    Math.abs(cells[cellIndex].borders.topLeft.y - rectTopLeftY) < 0.1 &&
                    Math.abs(cells[cellIndex].borders.rightBottom.x - rectRightBottomX) < 0.1 &&
                    Math.abs(cells[cellIndex].borders.rightBottom.y - rectRightBottomY) < 0.1) {
                    cells[cellIndex].isYellow = true;
                }
            }
        }
    }
    return cells;
}
// необходимо тщательное тестирование
function parseLessonString(lessonString) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const timeLimitRegExp = /с\s\d+\sнед\.\sпо\s\d+\sнед\./;
    const cabinetRegExp = /\s((\d+[а-я]?)|([А-Я]))-\d+/;
    const lessonTypeRegExp = /\s(лк|лб|пр)\s/;
    const teacherRegExp = /\s[А-Я][а-я]+\s[А-Я]\.\s?[А-Я]\./;
    const endOfLessonRegExp = /[а-яА-Я]+\.($|\s[А-Я])/;
    let res = [];
    let lessonStringCopy = lessonString;
    const lessonStringArray = (_a = lessonStringCopy.match(endOfLessonRegExp)) !== null && _a !== void 0 ? _a : [];
    if (lessonStringArray === []) {
        console.log("Cant define end of string", lessonStringCopy);
    }
    const lessonCounter = (_c = (_b = lessonStringCopy.match(endOfLessonRegExp)) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 1;
    for (let i = 0; i < lessonCounter; i++) {
        let currentLessonText;
        // console.log(lessonStringArray)
        if (lessonStringArray === []) {
            currentLessonText = lessonStringCopy;
        }
        else {
            if (i < lessonCounter - 1) {
                currentLessonText = lessonStringCopy.substring(0, lessonStringCopy.indexOf(lessonStringArray[i]) + lessonStringArray[i].length - 2);
                lessonStringCopy = lessonStringCopy.replace(currentLessonText + " ", "");
            }
            else {
                currentLessonText = lessonStringCopy;
            }
        }
        // время проведения пары, этот тескт убирать из текста пары не стоит
        const timeOfLesson = (_d = currentLessonText.match(timeLimitRegExp)) !== null && _d !== void 0 ? _d : [];
        let timeStart = 0;
        let timeEnd = -1;
        if (timeOfLesson.length !== 0) {
            const timeStratEndArray = (_e = timeOfLesson[0].match(/\d+/)) !== null && _e !== void 0 ? _e : [];
            if (timeStratEndArray.length === 0) {
                throw "Unexpected error in regex parsing" + currentLessonText;
            }
            timeStart = parseInt(timeStratEndArray[0]);
            timeEnd = parseInt(timeStratEndArray[1]);
        }
        const cabinetArray = (_f = currentLessonText.match(cabinetRegExp)) !== null && _f !== void 0 ? _f : [];
        let cabinet = "";
        if (cabinetArray.length === 0) {
            console.log("Bad cabinet parsing", currentLessonText);
        }
        else {
            cabinet = cabinetArray[0].trim();
        }
        currentLessonText = currentLessonText.replace(cabinetRegExp, "");
        const lessonTypeArray = (_g = currentLessonText.match(lessonTypeRegExp)) !== null && _g !== void 0 ? _g : [];
        let lessonType = "";
        if (lessonTypeArray.length === 0) {
            console.log("Bad lesson parsing", currentLessonText);
        }
        else {
            lessonType = lessonTypeArray[0].trim();
        }
        currentLessonText = currentLessonText.replace(lessonType, "");
        const teacherArray = (_h = currentLessonText.match(teacherRegExp)) !== null && _h !== void 0 ? _h : [];
        let techer = "";
        if (teacherArray.length === 0) {
            console.log("Bad teacher parsing", currentLessonText);
        }
        else {
            techer = teacherArray[0].substring(1);
        }
        currentLessonText = currentLessonText.replace(techer, "");
        currentLessonText = currentLessonText.replace("  ", " ");
        const currnetRes = {
            timeStart: timeStart,
            timeEnd: timeEnd,
            cabinet: cabinet,
            lessonType: lessonType,
            techer: techer,
            lesson: currentLessonText,
        };
        res.push(currnetRes);
    }
    return res;
}
const pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataError", (errData) => { console.error(errData.parserError); });
pdfParser.on("pdfParser_dataReady", (pdfData) => {
    fs.writeFile("./res.json", decodeURIComponent(JSON.stringify(pdfData)), (response) => {
        const borders = getTextBordersCoordinates(pdfData, 0);
        let cells = getTextInCells(pdfData, 0, borders);
        cells = defineCellsColor(pdfData, 0, cells);
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].text !== "") {
                console.log(parseLessonString(cells[i].text));
            }
        }
    });
});
pdfParser.loadPDF('./1.pdf');
