"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.app.on('web-contents-created', function (event, contents) {
    contents.on('will-attach-webview', function (event, webPreferences) {
        delete webPreferences.preload;
        webPreferences.nodeIntegration = false;
        webPreferences.webSecurity = true;
        webPreferences.allowRunningInsecureContent = false;
        webPreferences.experimentalFeatures = false;
        // For now, we never use <webview>. Just disable it entirely.
        event.preventDefault();
    });
    contents.on('will-navigate', event => {
        event.preventDefault();
    });
});
electron_1.app.on('ready', function () {
    electron_1.session.defaultSession.setPermissionRequestHandler(function (webContents, permission, callback) {
        const url = webContents.getURL();
        if (url.startsWith('file://')) {
            callback(true);
        }
        else {
            callback(false);
        }
    });
});
