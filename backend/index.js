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
        this.borders = borders;
    }
}
//   text: 'c 31.01.2022 по 08.06.2022',
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
        result.push(textCellItem);
    }
    return result;
}
const pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataError", (errData) => { console.error(errData.parserError); });
pdfParser.on("pdfParser_dataReady", (pdfData) => {
    fs.writeFile("./res.json", decodeURIComponent(JSON.stringify(pdfData)), (response) => {
        const borders = getTextBordersCoordinates(pdfData, 0);
        const cells = getTextInCells(pdfData, 0, borders);
        console.log(cells.length);
        for (let i = 0; i < cells.length && i < 50; i++) {
            console.log(cells[i]);
        }
    });
});
pdfParser.loadPDF('./1.pdf');
