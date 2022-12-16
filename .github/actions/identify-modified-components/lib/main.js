"use strict";
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
const minimatch_1 = __importDefault(require("minimatch"));
const fs_1 = require("fs");
function getComponents() {
    const componentsFile = (0, core_1.getInput)("components-json", {
        required: true,
        trimWhitespace: true,
    });
    const contents = (0, fs_1.readFileSync)(componentsFile, "utf8");
    return JSON.parse(contents);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const differences = yield (0, github_service_1.getFilesModifiedFromPreviousRelease)(process_1.env);
            (0, core_1.debug)(`Files modified :: \n ${differences.join("\n")}`);
            const components = yield getComponents();
            const modifiedComponents = Object.entries(components).reduce((filtered, [component, metadata]) => {
                var _a;
                let componentDifferences = metadata.pathPattern.reduce((result, pattern) => {
                    result.push(...minimatch_1.default.match(differences, pattern));
                    return result;
                }, []);
                componentDifferences = ((_a = metadata.excludePathPattern) !== null && _a !== void 0 ? _a : []).reduce((componentDifferences, pattern) => {
                    const differencesToBeExcluded = minimatch_1.default.match(componentDifferences, pattern);
                    return componentDifferences.filter((_) => !differencesToBeExcluded.includes(_));
                }, componentDifferences);
                if (componentDifferences.length > 0)
                    filtered.push(Object.assign(Object.assign({}, metadata), { component }));
                return filtered;
            }, []);
            (0, core_1.startGroup)("Components modified");
            (0, core_1.info)(modifiedComponents.map((_) => _.component).join("\n"));
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
