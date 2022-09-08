"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = exports.intoParams = void 0;
/** GitHub exposes `with` input fields in the form of env vars prefixed with INPUT_ */
const FileFilter = /INPUT_(\w+)_FILES/;
const cleanRef = (ref) => {
    if (ref.indexOf("refs/heads/") === 0) {
        return ref.substring(11);
    }
    if (ref.indexOf("refs/tags/") === 0) {
        return ref.substring(10);
    }
    return ref;
};
const intoParams = (config) => {
    const [owner, repo] = config.githubRepository.split("/", 2);
    const head = cleanRef(config.githubRef);
    const base = config.base || "master";
    const ref = config.sha;
    return {
        base,
        head,
        owner,
        repo,
        ref,
    };
};
exports.intoParams = intoParams;
const parseConfig = (env) => {
    return {
        githubToken: env.GITHUB_TOKEN || "",
        githubRef: env.GITHUB_HEAD_REF || env.GITHUB_REF || "",
        githubRepository: env.GITHUB_REPOSITORY || "",
        base: env.INPUT_BASE,
        fileFilters: Array.from(Object.entries(env)).reduce((filters, [key, value]) => {
            if (FileFilter.test(key)) {
                filters[key.toLowerCase().replace("input_", "")] = value;
            }
            return filters;
        }, {}),
        sha: env.GITHUB_SHA || "",
    };
};
exports.parseConfig = parseConfig;
