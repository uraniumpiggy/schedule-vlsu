"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
const express_1 = __importDefault(require("express"));
const consts_1 = __importDefault(require("./consts"));
const app = express_1.default();
const port = 3000;
const appRootDir = consts_1.default.appRootDir;
const pdfRootDir = consts_1.default.pdfRootDir;
const vlsuURL = consts_1.default.vlsuURL;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
function parseSite(rootDir) {
    axios_1.default.get(vlsuURL).then((response) => {
        const dom = new jsdom_1.JSDOM(response.data);
        fs_1.default.rmdirSync(rootDir, { recursive: true });
        fs_1.default.mkdirSync(rootDir);
        dom.window.document.querySelectorAll('a').forEach((link) => {
            if (link.href.includes(".pdf")) {
                const writer = fs_1.default.createWriteStream(rootDir + '/' + link.text);
                axios_1.default({
                    url: link.href,
                    responseType: 'stream'
                }).then((response) => {
                    response.data.pipe(writer);
                    writer.on('error', err => {
                        console.error(err);
                        writer.close();
                    });
                });
            }
        });
    }).catch((err) => console.error(err));
}
parseSite(pdfRootDir);
fs_1.default.readdirSync(appRootDir).map((fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const components = fileName.split('.');
    if (components[1] == 'js')
        return;
    const routesInfo = (yield Promise.resolve().then(() => __importStar(require('./app/' + components[0])))).default;
    routesInfo.forEach((info) => app[info.method]('/' + components[0], info.func));
}));
app.listen(port, () => console.log('Server start in port: ' + port));
node_cron_1.default.schedule("0 0 0-23 * * *", () => {
    console.log("Updating PDF start");
    parseSite(pdfRootDir);
    console.log("Updating PDF end");
});
