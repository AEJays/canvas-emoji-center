import { CanvasTextAlign } from './../node_modules/canvas/types/index.d';
import { CanvasRenderingContext2D } from 'canvas';
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
export declare class CanvasEmoji {
    private canvasCtx;
    constructor(ctx: CanvasRenderingContext2D);
    getEmojiKeys(str: string): string[];
    replaceEmojiToEmojiName(str: string): {
        str: string;
        emojiArr: any;
    };
    getStrLength(str: string, emojiW?: number): number;
    drawPngReplaceEmoji(data: DrawPngReplaceEmojiParams): {
        x: number;
    };
    drawPngReplaceEmojiWithEmojicdn(data: DrawPngReplaceEmojiParams): Promise<{
        x: number;
    }>;
    private showText;
}
