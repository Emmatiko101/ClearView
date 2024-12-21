import { AfterPackContext } from 'electron-builder';
declare const beforePackHook: (context: AfterPackContext) => Promise<void>;
export default beforePackHook;
