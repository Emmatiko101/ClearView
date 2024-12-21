"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rebuild_1 = require("@electron/rebuild");
const copyfiles_1 = __importDefault(require("copyfiles"));
const electron_builder_1 = require("electron-builder");
/* The beforePackHook runs before packing the Electron app for an architecture
We hook in here to build anything architecture dependent - such as beter-sqlite3
To build, we call @electron/rebuild on the better-sqlite3 module */
const beforePackHook = async (context) => {
    const arch = electron_builder_1.Arch[context.arch];
    const buildPath = context.packager.projectDir;
    const projectRootPath = buildPath + '/../../';
    const electronVersion = context.packager.config.electronVersion;
    if (!electronVersion) {
        console.error('beforePackHook: Unable to find electron version.');
        process.exit(); // End the process - electron version is required
    }
    try {
        await (0, rebuild_1.rebuild)({
            arch,
            buildPath,
            electronVersion,
            force: true,
            projectRootPath,
            onlyModules: ['better-sqlite3'],
        });
        console.info(`Rebuilt better-sqlite3 with ${arch}!`);
        if (context.packager.platform.name === 'windows') {
            console.info(`Windows build - copying appx files...`);
            await new Promise(resolve => (0, copyfiles_1.default)(['./appx/**/*', './build'], { error: true }, resolve));
            console.info(`Copied appx files!`);
        }
    }
    catch (err) {
        console.error('beforePackHook:', err);
        process.exit(); // End the process - unsuccessful build
    }
};
// eslint-disable-next-line import/no-unused-modules, import/no-default-export
exports.default = beforePackHook;
