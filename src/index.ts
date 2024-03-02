import { CanvasTextAlign } from './../node_modules/canvas/types/index.d';
import { CanvasRenderingContext2D, Image, loadImage } from 'canvas';
// @ts-ignore
import * as emoji from 'node-emoji';
import * as fs from 'fs';
import * as path from 'path';

export interface DrawPngReplaceEmojiParams {
  text: string;
  fillStyle: string;
  font: string;
  x: number;
  y: number;
  emojiW: number;
  emojiH: number;
  length?: number;
  emojiStyle?: string;
  float: CanvasTextAlign;
}

export class CanvasEmoji {
  private canvasCtx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.canvasCtx = ctx;
  }

  /**
   * 获取字符串中所有的emoji表情的名称
   * @param str
   */
  getEmojiKeys(str: string) {
    const emojiArr: string[] = [];
    emoji.replace(str, (item: any) => {
      emojiArr.push(`${item.key}`);
    });
    return emojiArr;
  }

  /**
   * 替换全部的表情变为名称并用
   * @param str
   */
  replaceEmojiToEmojiName(str: string) {
    const emojiArr: any = [];
    str = emoji.replace(str, (item: any) => {
      emojiArr.push(`{${item.key}}`);
      return `{${item.key}}`;
    });
    return {
      str,
      emojiArr,
    };
  }
  /* 
    获取字符串长度(字体大小一致)
  */
  getStrLength(str: string, emojiW: number = 12) {
    let emojiLen = 0
    let redux = /(?<={)[^}]+(?=})/g
    let outWidth = 0
    let newStr = str.replace(redux, '').replace(/{}/g,'')
    let emojiNum:any = str.match(redux)
    if(emojiNum){
      emojiLen = emojiNum.length
    }
    outWidth = this.canvasCtx.measureText(newStr).width+ emojiLen * emojiW
    return outWidth
  }
  /**
   *
   * @param data
   */
  drawPngReplaceEmoji(data: DrawPngReplaceEmojiParams) {
    const { canvasCtx } = this;
    const { fillStyle, font, y, emojiW, emojiH } = data;
    let { text, x, length } = data;
    let { float="left" } = data;
    let getX:Function = (nowX: number, width: number) => {
      if(float == 'left'){
        return nowX;
      }else if(float == 'center'){
        return nowX + ((canvasCtx.canvas.width - width) / 2) 
      }else{
        return canvasCtx.canvas.width - nowX;
      }
    }
    canvasCtx.fillStyle = fillStyle;
    canvasCtx.font = font;
    canvasCtx.textAlign = float;
    const emojiArr: string[] = [];
    text = emoji.replace(text, (item: any) => {
      emojiArr.push(`{${item.key}}`);
      return `{${item.key}}`;
    });
    let ctxText;
    let i = 0;
    let strWidth = this.getStrLength(text, emojiW)
    // 初始化 x 
    let oldWidth = 0;

    if(float === "center" || float === "right"){
      x += getX(x, strWidth)
      oldWidth = x - strWidth
      if(float === "right"){
        x = oldWidth
      }
    }
    const emojiMap = new Map();
    for (const emojiItem of emojiArr) {
      const index = text.indexOf(emojiItem);
      if (length !== -1 && length - text.substring(0, index).length <= 0) {
        canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
        ctxText = this.canvasCtx.measureText(`${text.substring(0, length)}...`);
        if(float === 'left'){
          x += ctxText.width;
        }else if(float === 'right'){
          oldWidth += ctxText.width
          x = oldWidth;
        }else if(float === 'center'){
          x += ctxText.width
        }
        break;
      }
      canvasCtx.fillText(text.substring(0, index), x, y);
      ctxText = canvasCtx.measureText(text.substring(0, index));
      // x += ctxText.width;
      if(float === 'left'){
        x += ctxText.width;
      }else if(float === 'right'){
        console.log(ctxText,oldWidth)
        oldWidth += ctxText.width
        x = oldWidth;
      }else if(float === 'center'){
        x += ctxText.width;
      }
      const emojiImg = new Image();
      const emojiName = emojiItem.replace('{', '').replace('}', '');
      let src = emojiMap.get(emojiName);
      if (!src) {
        if (
          fs.existsSync(path.join(__dirname, `../emoji_pngs/${emojiName}.png`))
        ) {
          src = fs.readFileSync(
            path.join(__dirname, `../emoji_pngs/${emojiName}.png`),
          );
          emojiMap.set(emojiName, src);
        }
      }
      if (src) {
        emojiImg.src = src;
        if(float == "left"){
          canvasCtx.drawImage(emojiImg, x, y - (5 / 6) * emojiH, emojiW, emojiH);
          x += emojiW;
        }else if(float == "center"){
          // x -= emojiW / 4;
          x += emojiW;
          canvasCtx.drawImage(emojiImg, x - emojiW * 2 - emojiW, y - (5 / 6) * emojiH, emojiW, emojiH);
          // x += emojiW;
        }else if(float == "right"){
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
        if(float === 'left'){
          x += ctxText.width;
        }else if(float === 'right'){
          oldWidth += ctxText.width
          x = oldWidth;
        }else if(float === 'center'){
          x += ctxText.width;
        }
        // x += ctxText.width;
      }
      if (length !== -1) {
        length -= text.substring(0, index).length + 1;
        if (length === 0) {
          canvasCtx.fillText('...', x, y);
          ctxText = canvasCtx.measureText('...');
          // x += ctxText.width;
          if(float === 'left'){
            x += ctxText.width;
          }else if(float === 'right'){
            oldWidth += ctxText.width
            x = oldWidth;
          }else if(float === 'center'){
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
      // x += ctxText.width;
      if(float === 'left'){
        x += ctxText.width;
      }else if(float === 'right'){
        oldWidth += ctxText.width
        x = oldWidth;
      }else if(float === 'center'){
        x += ctxText.width;
      }
    }
    return { x };
  }

  async drawPngReplaceEmojiWithEmojicdn(data: DrawPngReplaceEmojiParams) {
    const { fillStyle, font, y, emojiW, emojiH, emojiStyle = 'google' } = data;
    const { canvasCtx } = this;
    canvasCtx.fillStyle = fillStyle;
    canvasCtx.font = font;
    let { text, x, length } = data;
    const emojiArr: string[] = [];
    text = emoji.replace(text, (item: any) => {
      emojiArr.push(`{${item.key}}`);
      return `{${item.key}}`;
    });
    const loadImages = [];
    const emojiSet = new Set();
    const emojiMap = new Map();
    const fun = async (emojiItem: string) => {
      const url = encodeURI(`https://emojicdn.elk.sh/${emojiItem
      .replace('{', '')
      .replace('}', '')}?style=${emojiStyle}`);
      const emojiImg = await loadImage(url);
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

  private showText(text: string, length: number = 10) {
    if (text.length > length) {
      return text.slice(0, length) + '...';
    } else {
      return text;
    }
  }
}