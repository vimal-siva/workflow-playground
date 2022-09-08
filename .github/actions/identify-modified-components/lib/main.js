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
const util_1 = require("./util");
const diff_1 = require("./diff");
const core_1 = require("@actions/core");
const rest_1 = require("@octokit/rest");
const process_1 = require("process");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = (0, util_1.parseConfig)(process_1.env);
            rest_1.Octokit.plugin(require("@octokit/plugin-throttling"));
            const differ = new diff_1.GitHubDiff(new rest_1.Octokit({
                auth: config.githubToken,
                onRateLimit: (retryAfter, options) => {
                    (0, core_1.warning)(`Request quota exhausted for request ${options.method} ${options.url}`);
                    if (options.request.retryCount === 0) {
                        // only retries once
                        (0, core_1.warning)(`Retrying after ${retryAfter} seconds!`);
                        return true;
                    }
                },
                onAbuseLimit: (retryAfter, options) => {
                    // does not retry, only logs a warning
                    (0, core_1.warning)(`Abuse detected for request ${options.method} ${options.url}`);
                },
            }));
            const diffset = yield differ.diff((0, util_1.intoParams)(config));
            (0, core_1.setOutput)("files", diffset.join(" "));
            let filterSets = (0, diff_1.sets)(config.fileFilters, diffset);
            Array.from(Object.entries(filterSets)).forEach(([key, matches]) => {
                (0, core_1.debug)(`files for ${key} ${matches}`);
                (0, core_1.setOutput)(key, matches.join(" "));
            });
        }
        catch (error) {
            console.log(error);
            (0, core_1.setFailed)(error.message);
        }
    });
}
run();
