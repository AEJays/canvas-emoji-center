"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasEmoji = void 0;
const canvas_1 = require("canvas");
const emoji = require("node-emoji");
const fs = require("fs");
const path = require("path");
class CanvasEmoji {
    constructor(ctx) {
        this.canvasCtx = ctx;
    }
    getEmojiKeys(str) {
        const emojiArr = [];
        emoji.replace(str, (item) => {
            emojiArr.push(`${item.key}`);
        });
        return emojiArr;
    }
    replaceEmojiToEmojiName(str) {
        const emojiArr = [];
        str = emoji.replace(str, (item) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        return {
            str,
            emojiArr,
        };
    }
    getStrLength(str, emojiW = 12) {
        let emojiLen = 0;
        let redux = /(?<={)[^}]+(?=})/g;
        let outWidth = 0;
        let newStr = str.replace(redux, '').replace(/{}/g, '');
        let emojiNum = str.match(redux);
        if (emojiNum) {
            emojiLen = emojiNum.length;
        }
        outWidth = this.canvasCtx.measureText(newStr).width + emojiLen * emojiW;
        return outWidth;
    }
    drawPngReplaceEmoji(data) {
        const { canvasCtx } = this;
        const { fillStyle, font, y, emojiW, emojiH } = data;
        let { text, x, length } = data;
        let { float = "left" } = data;
        let getX = (nowX, width) => {
            if (float == 'left') {
                return nowX;
            }
            else if (float == 'center') {
                return ((canvasCtx.canvas.width - width) / 2);
            }
            else {
                return canvasCtx.canvas.width - nowX;
            }
        };
        canvasCtx.fillStyle = fillStyle;
        canvasCtx.font = font;
        canvasCtx.textAlign = float;
        const emojiArr = [];
        text = emoji.replace(text, (item) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        let ctxText;
        let i = 0;
        let strWidth = this.getStrLength(text, emojiW);
        let oldWidth = 0;
        if (float === "center" || float === "right") {
            x = getX(x, strWidth);
            oldWidth = x - strWidth;
            if (float === "right") {
                x = oldWidth;
            }
        }
        const emojiMap = new Map();
        for (const emojiItem of emojiArr) {
            const index = text.indexOf(emojiItem);
            if (length !== -1 && length - text.substring(0, index).length <= 0) {
                canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
                ctxText = this.canvasCtx.measureText(`${text.substring(0, length)}...`);
                if (float === 'left') {
                    x += ctxText.width;
                }
                else if (float === 'right') {
                    oldWidth += ctxText.width;
                    x = oldWidth;
                }
                else if (float === 'center') {
                    x += ctxText.width;
                }
                break;
            }
            canvasCtx.fillText(text.substring(0, index), x, y);
            ctxText = canvasCtx.measureText(text.substring(0, index));
            if (float === 'left') {
                x += ctxText.width;
            }
            else if (float === 'right') {
                console.log(ctxText, oldWidth);
                oldWidth += ctxText.width;
                x = oldWidth;
            }
            else if (float === 'center') {
                x += ctxText.width;
            }
            const emojiImg = new canvas_1.Image();
            const emojiName = emojiItem.replace('{', '').replace('}', '');
            let src = emojiMap.get(emojiName);
            if (!src) {
                if (fs.existsSync(path.join(__dirname, `../emoji_pngs/${emojiName}.png`))) {
                    src = fs.readFileSync(path.join(__dirname, `../emoji_pngs/${emojiName}.png`));
                    emojiMap.set(emojiName, src);
                }
            }
            if (src) {
                emojiImg.src = src;
                if (float == "left") {
                    canvasCtx.drawImage(emojiImg, x, y - (5 / 6) * emojiH, emojiW, emojiH);
                    x += emojiW;
                }
                else if (float == "center") {
                    x += emojiW;
                    canvasCtx.drawImage(emojiImg, x - emojiW * 2 - emojiW, y - (5 / 6) * emojiH, emojiW, emojiH);
                }
                else if (float == "right") {
                    oldWidth += emojiW;
                    x = oldWidth;
                    canvasCtx.drawImage(emojiImg, x - emojiW * 2 - emojiW * 3, y - (5 / 6) * emojiH, emojiW, emojiH);
                }
            }
            text = text.substring(index + emojiItem.length);
            i++;
            if (i === emojiArr.length) {
                canvasCtx.fillText(text, x, y);
                ctxText = canvasCtx.measureText(text);
                if (float === 'left') {
                    x += ctxText.width;
                }
                else if (float === 'right') {
                    oldWidth += ctxText.width;
                    x = oldWidth;
                }
                else if (float === 'center') {
                    x += ctxText.width;
                }
            }
            if (length !== -1) {
                length -= text.substring(0, index).length + 1;
                if (length === 0) {
                    canvasCtx.fillText('...', x, y);
                    ctxText = canvasCtx.measureText('...');
                    if (float === 'left') {
                        x += ctxText.width;
                    }
                    else if (float === 'right') {
                        oldWidth += ctxText.width;
                        x = oldWidth;
                    }
                    else if (float === 'center') {
                        x += ctxText.width;
                    }
                    break;
                }
            }
        }
        if (emojiArr.length === 0) {
            if (length) {
                text = this.showText(text, length);
            }
            canvasCtx.fillText(text, x, y);
            const ctxText = canvasCtx.measureText(text);
            if (float === 'left') {
                x += ctxText.width;
            }
            else if (float === 'right') {
                oldWidth += ctxText.width;
                x = oldWidth;
            }
            else if (float === 'center') {
                x += ctxText.width;
            }
        }
        return { x };
    }
    async drawPngReplaceEmojiWithEmojicdn(data) {
        const { fillStyle, font, y, emojiW, emojiH, emojiStyle = 'google' } = data;
        const { canvasCtx } = this;
        canvasCtx.fillStyle = fillStyle;
        canvasCtx.font = font;
        let { text, x, length } = data;
        const emojiArr = [];
        text = emoji.replace(text, (item) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        const loadImages = [];
        const emojiSet = new Set();
        const emojiMap = new Map();
        const fun = async (emojiItem) => {
            const url = encodeURI(`https://emojicdn.elk.sh/${emojiItem
                .replace('{', '')
                .replace('}', '')}?style=${emojiStyle}`);
            const emojiImg = await (0, canvas_1.loadImage)(url);
            emojiMap.set(emojiItem, emojiImg);
        };
        for (const emojiItem of emojiArr) {
            if (emojiSet.has(emojiItem)) {
                continue;
            }
            emojiSet.add(emojiItem);
            loadImages.push(fun(emojiItem));
        }
        await Promise.all(loadImages);
        for (let i = 0; i < emojiArr.length; i++) {
            const emojiItem = emojiArr[i];
            const index = text.indexOf(emojiItem);
            if (length !== -1 && length - text.substring(0, index).length <= 0) {
                canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
                x += canvasCtx.measureText(`${text.substring(0, length)}...`).width;
                break;
            }
            canvasCtx.fillText(text.substring(0, index), x, y);
            const ctxText = canvasCtx.measureText(text.substring(0, index));
            x += ctxText.width;
            const emojiImg = emojiMap.get(emojiItem);
            canvasCtx.drawImage(emojiImg, x, y - (5 / 6) * emojiH, emojiW, emojiH);
            x += emojiW;
            text = text.substring(index + emojiItem.length);
            if (i === emojiArr.length - 1) {
                canvasCtx.fillText(text, x, y);
                x += canvasCtx.measureText(text).width;
            }
            if (length !== -1) {
                length -= text.substring(0, index).length + 1;
                if (length === 0) {
                    canvasCtx.fillText('...', x, y);
                    x += canvasCtx.measureText('...').width;
                    break;
                }
            }
        }
        if (emojiArr.length === 0) {
            if (length) {
                text = this.showText(text, length);
            }
            canvasCtx.fillText(text, x, y);
            const ctxText = canvasCtx.measureText(text);
            x += ctxText.width;
        }
        return { x };
    }
    showText(text, length = 10) {
        if (text.length > length) {
            return text.slice(0, length) + '...';
        }
        else {
            return text;
        }
    }
}
exports.CanvasEmoji = CanvasEmoji;
//# sourceMappingURL=index.js.map