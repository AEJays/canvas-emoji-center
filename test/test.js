const {createCanvas} = require('canvas');
const {CanvasEmoji} = require('../dist/index');
const fs = require('fs');


function drawPngReplaceEmoji() {
    const canvas = createCanvas(800, 200);
    const canvasCtx = canvas.getContext("2d");
    const canvasEmoji = new CanvasEmoji(canvasCtx);
    // const len = canvasEmoji.getStrLength("测试一下哦测试一下{kiss}测试一下{kiss}{dancer}测试一下{kiss}测试一下{kiss}{dancer}")
    // console.log(len)
    const a = canvasEmoji.drawPngReplaceEmoji({
        text: "广州复古咖啡馆😍😍😍😍😍😍真爱了",
        fillStyle: "#000000",
        font: "bold 36px Impact",
        x: 0,
        y: 100,
        emojiW: 36,
        emojiH: 36,
        length: -1,
        float: 'center',
        isMax: true
    });
    const out = fs.createWriteStream(__dirname + "/test.png");
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log("The PNG file was created."));
    return a;
}

async function drawPngReplaceEmojiWithEmojicdn() {
    const canvas = createCanvas(800, 200);
    const canvasCtx = canvas.getContext("2d");
    const canvasEmoji = new CanvasEmoji(canvasCtx);
    const a = await canvasEmoji.drawPngReplaceEmojiWithEmojicdn({
        text: "测试一下哦💋💃测试一下💋测试一下💋💃测试一下💋测试一下💋💃",
        fillStyle: "#000000",
        font: "bold 12px Impact",
        x: 0,
        y: 100,
        emojiW: 12,
        emojiH: 12,
        length: 20,
        emojiStyle: 'apple'
    });
    const out = fs.createWriteStream(__dirname + "/test2.png");
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log("The PNG file was created."));
    return a;
}

console.log(drawPngReplaceEmoji());
// drawPngReplaceEmojiWithEmojicdn();
