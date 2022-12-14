"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const process_1 = require("process");
const github_service_1 = require("./github.service");
const minimatch_1 = require("minimatch");
const node_fetch_1 = __importDefault(require("node-fetch"));
const path = __importStar(require("path"));
function getComponents() {
    const componentsFile = (0, core_1.getInput)("components-json", {
        required: true,
        trimWhitespace: true,
    });
    const workspacePath = process.env[`GITHUB_WORKSPACE`] || "";
    const absoluteFilePath = path.join(workspacePath, componentsFile);
    return (0, node_fetch_1.default)(absoluteFilePath).then((value) => value.json());
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const differences = yield (0, github_service_1.getFilesModifiedFromPreviousRelease)(process_1.env);
            (0, core_1.debug)(`Files modified :: \n ${differences.join("\n")}`);
            const components = yield getComponents();
            const modifiedComponents = Object.entries(components).reduce((filtered, [component, metadata]) => {
                const isModified = metadata.pathPattern.some((pattern) => {
                    const matcher = new minimatch_1.Minimatch(pattern);
                    return differences.some((file) => matcher.match(file));
                });
                if (isModified)
                    filtered.push(Object.assign(Object.assign({}, metadata), { component }));
                return filtered;
            }, []);
            (0, core_1.startGroup)("Components modified");
            (0, core_1.info)(Object.keys(modifiedComponents).join("\n"));
            (0, core_1.endGroup)();
            (0, core_1.setOutput)("components-matrix", modifiedComponents);
        }
        catch (error) {
            console.log(error);
            (0, core_1.setFailed)(error.message);
        }
    });
}
run();
