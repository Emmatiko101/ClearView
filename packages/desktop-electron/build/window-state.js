"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listen = listen;
exports.get = get;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = __importDefault(require("electron"));
const getDataDir = () => {
    if (!process.env.ACTUAL_DATA_DIR) {
        throw new Error('ACTUAL_DATA_DIR is not set');
    }
    return process.env.ACTUAL_DATA_DIR;
};
async function loadState() {
    let state = undefined;
    try {
        state = JSON.parse(fs_1.default.readFileSync(path_1.default.join(getDataDir(), 'window.json'), 'utf8'));
    }
    catch (e) {
        console.log('Could not load window state');
    }
    return validateState(state);
}
function updateState(win, state) {
    const screen = electron_1.default.screen;
    const bounds = win.getBounds();
    if (!win.isMaximized() && !win.isMinimized() && !win.isFullScreen()) {
        state.width = bounds.width;
        state.height = bounds.height;
    }
    state.x = bounds.x;
    state.y = bounds.y;
    state.isMaximized = win.isMaximized();
    state.isFullScreen = win.isFullScreen();
    state.displayBounds = screen.getDisplayMatching(bounds).bounds;
}
async function saveState(win, state) {
    updateState(win, state);
    fs_1.default.writeFileSync(path_1.default.join(getDataDir(), 'window.json'), JSON.stringify(state), 'utf8');
}
function listen(win, state) {
    if (state.isMaximized) {
        win.maximize();
    }
    if (state.isFullScreen) {
        win.setFullScreen(true);
    }
    const saver = saveState.bind(null, win, state);
    win.on('close', saver);
    return () => {
        win.removeListener('close', saver);
    };
}
function hasBounds(state) {
    return (Number.isInteger(state.x) &&
        Number.isInteger(state.y) &&
        Number.isInteger(state.width) &&
        state.width > 0 &&
        Number.isInteger(state.height) &&
        state.height > 0);
}
function validateState(state) {
    if (!state ||
        !(hasBounds(state) || state.isMaximized || state.isFullScreen)) {
        return {};
    }
    const newState = Object.assign({}, state);
    if (hasBounds(state) && state.displayBounds) {
        const screen = electron_1.default.screen;
        // Check if the display where the window was last open is still available
        const displayBounds = screen.getDisplayMatching(state).bounds;
        if (state.displayBounds.x !== displayBounds.x ||
            state.displayBounds.y !== displayBounds.y ||
            state.displayBounds.width !== displayBounds.width ||
            state.displayBounds.height !== displayBounds.height) {
            if (displayBounds.width < state.displayBounds.width) {
                if (state.x > displayBounds.width) {
                    newState.x = 0;
                }
                if (state.width > displayBounds.width) {
                    newState.width = displayBounds.width;
                }
            }
            if (displayBounds.height < state.displayBounds.height) {
                if (state.y > displayBounds.height) {
                    newState.y = 0;
                }
                if (state.height > displayBounds.height) {
                    newState.height = displayBounds.height;
                }
            }
        }
    }
    return newState;
}
async function get() {
    const screen = electron_1.default.screen;
    const displayBounds = screen.getPrimaryDisplay().bounds;
    const state = Object.assign({
        x: 100,
        y: 50,
        width: Math.min(1000, displayBounds.width - 100),
        height: Math.min(700, displayBounds.width - 50),
    }, await loadState());
    return state;
}
