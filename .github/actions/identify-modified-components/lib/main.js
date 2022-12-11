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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const process_1 = require("process");
const github_service_1 = require("./github.service");
const diff_1 = require("./diff");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const differences = yield (0, github_service_1.getFilesModifiedFromPreviousRelease)(process_1.env);
            (0, core_1.debug)(`Files modified :: \n ${differences.join('\n')}`);
            const componentFilters = {
                frontend: "frontend/**",
                backend: "backend/**",
                adf: "adf-config/**",
            };
            let filterSets = (0, diff_1.sets)(componentFilters, differences);
            (0, core_1.startGroup)('Components modified');
            (0, core_1.info)(Object.keys(filterSets).join("\n"));
            (0, core_1.endGroup)();
        }
        catch (error) {
            console.log(error);
            (0, core_1.setFailed)(error.message);
        }
    });
}
run();
