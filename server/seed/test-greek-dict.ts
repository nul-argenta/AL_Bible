import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const greekPath = path.resolve(__dirname, "../../node_modules/strongs/greek/strongs-greek-dictionary.js");
const greekDict = require(greekPath);

console.log("G1:", greekDict["G1"]);
console.log("G208:", greekDict["G208"]);
