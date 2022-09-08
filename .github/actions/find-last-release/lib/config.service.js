"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = void 0;
function parseConfig(env) {
    const [owner, repo] = (env.GITHUB_REPOSITORY || "").split("/", 2);
    return {
        githubToken: env.GITHUB_TOKEN || "",
        owner,
        repo
    };
}
exports.parseConfig = parseConfig;
;
