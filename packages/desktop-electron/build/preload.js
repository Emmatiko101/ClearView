"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const { version: VERSION, isDev: IS_DEV } = electron_1.ipcRenderer.sendSync('get-bootstrap-data');
electron_1.contextBridge.exposeInMainWorld('ClearView', {
    IS_DEV,
    ACTUAL_VERSION: VERSION,
    logToTerminal: console.log,
    ipcConnect: (func) => {
        func({
            on(name, handler) {
                return electron_1.ipcRenderer.on(name, (_event, value) => handler(value));
            },
            emit(name, data) {
                return electron_1.ipcRenderer.send('message', { name, args: data });
            },
        });
    },
    relaunch: () => {
        electron_1.ipcRenderer.invoke('relaunch');
    },
    restartElectronServer: () => {
        electron_1.ipcRenderer.invoke('restart-server');
    },
    openFileDialog: (opts) => {
        return electron_1.ipcRenderer.invoke('open-file-dialog', opts);
    },
    saveFile: async (contents, filename, dialogTitle) => {
        await electron_1.ipcRenderer.invoke('save-file-dialog', {
            title: dialogTitle,
            defaultPath: filename,
            fileContents: contents,
        });
    },
    openURLInBrowser: (url) => {
        electron_1.ipcRenderer.invoke('open-external-url', url);
    },
    onEventFromMain: (type, handler) => {
        electron_1.ipcRenderer.on(type, handler);
    },
    updateAppMenu: (budgetId) => {
        electron_1.ipcRenderer.send('update-menu', budgetId);
    },
    // No auto-updates in the desktop app
    isUpdateReadyForDownload: () => false,
    waitForUpdateReadyForDownload: () => new Promise(() => { }),
    getServerSocket: () => {
        return null;
    },
    setTheme: (theme) => {
        electron_1.ipcRenderer.send('set-theme', theme);
    },
    moveBudgetDirectory: (currentBudgetDirectory, newDirectory) => {
        return electron_1.ipcRenderer.invoke('move-budget-directory', currentBudgetDirectory, newDirectory);
    },
});
