import { BrowserWindow } from 'electron';
type WindowState = Electron.Rectangle & {
    isMaximized?: boolean;
    isFullScreen?: boolean;
    displayBounds?: Electron.Rectangle;
};
export declare function listen(win: BrowserWindow, state: WindowState): () => void;
export declare function get(): Promise<WindowState>;
export {};
