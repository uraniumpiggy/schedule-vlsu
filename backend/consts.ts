import path from 'path'

export default {
    pdfRootDir: path.join(__dirname, './institutesTimetables'),
    appRootDir: path.join(__dirname, './app'),
    vlsuURL: 'https://www.vlsu.ru/index.php?id=165',
    dbURL: "mongodb://localhost:27017/schedule-vlsu",
}
