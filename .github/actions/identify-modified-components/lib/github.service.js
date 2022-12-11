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
exports.getFilesModifiedFromPreviousRelease = void 0;
const rest_1 = require("@octokit/rest");
const core_1 = require("@actions/core");
const console_1 = require("console");
function parseConfig(env) {
    const [owner, repo] = (env.GITHUB_REPOSITORY || "").split("/", 2);
    return {
        githubToken: env.GITHUB_TOKEN || "",
        owner,
        repo,
        base: env.INPUT_BASE || "main",
    };
}
function getFilesModifiedFromPreviousRelease(env) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const config = parseConfig(env);
        rest_1.Octokit.plugin(require("@octokit/plugin-throttling"));
        const octokit = new rest_1.Octokit({
            auth: config.githubToken,
            onRateLimit: (retryAfter, options) => {
                (0, core_1.warning)(`Request quota exhausted for request ${options.method} ${options.url}`);
                if (options.request.retryCount === 0) {
                    // only retries once
                    (0, core_1.warning)(`Retrying after ${retryAfter} seconds!`);
                    return true;
                }
            },
            onAbuseLimit: (_, options) => {
                // does not retry, only logs a warning
                (0, core_1.warning)(`Abuse detected for request ${options.method} ${options.url}`);
            },
        });
        const releases = yield octokit.repos.listReleases(Object.assign({}, config));
        const releasedTags = releases.data
            .filter((_) => !_.draft && !_.prerelease)
            .map((_) => _.tag_name);
        if (releasedTags.length < 2)
            (0, core_1.setFailed)("Failed to fetch previous release tag");
        (0, console_1.debug)(`Tags to compare :: ${releasedTags[0]} & ${releasedTags[1]}`);
        const commits = yield octokit.repos.compareCommits(Object.assign(Object.assign({}, config), { head: releasedTags[1] }));
        return ((_c = (_b = (_a = commits.data.files) === null || _a === void 0 ? void 0 : _a.filter((file) => file.status != "removed")) === null || _b === void 0 ? void 0 : _b.map((file) => file.filename)) !== null && _c !== void 0 ? _c : []);
    });
}
exports.getFilesModifiedFromPreviousRelease = getFilesModifiedFromPreviousRelease;
