import { OpenDialogSyncOptions, SaveDialogOptions } from 'electron';
import './security';
export type GetBootstrapDataPayload = {
    version: string;
    isDev: boolean;
};
export type OpenFileDialogPayload = {
    properties: OpenDialogSyncOptions['properties'];
    filters?: OpenDialogSyncOptions['filters'];
};
export type SaveFileDialogPayload = {
    title: SaveDialogOptions['title'];
    defaultPath?: SaveDialogOptions['defaultPath'];
    fileContents: string | NodeJS.ArrayBufferView;
};
