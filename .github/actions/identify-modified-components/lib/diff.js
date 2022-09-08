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
exports.GitHubDiff = exports.sets = void 0;
const minimatch_1 = require("minimatch");
/** produce a collection of named diff sets based on patterns defined in sets */
const sets = (filters, files) => Array.from(Object.entries(filters)).reduce((filtered, [key, patterns]) => patterns.split(/\r?\n/).reduce((filtered, pattern) => {
    let matcher = new minimatch_1.Minimatch(pattern);
    let matched = files.filter((file) => matcher.match(file));
    if (matched.length > 0) {
        filtered[key] = (filtered[key] || []).concat(matched);
    }
    return filtered;
}, filtered), {});
exports.sets = sets;
const isDefined = (s) => {
    return s != undefined;
};
class GitHubDiff {
    constructor(github) {
        this.github = github;
    }
    diff(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // if this is a merge to master push
            // base and head will both be the same
            if (params.base === params.head) {
                const commit = yield this.github.repos.getCommit(params);
                return (((_a = commit.data.files) === null || _a === void 0 ? void 0 : _a.filter((file) => file.status != "removed").map((file) => file.filename).filter(isDefined)) || []);
            }
            else {
                const response = yield this.github.repos.compareCommits(Object.assign(Object.assign({}, params), { ref: undefined }));
                return response.data.files
                    .filter((file) => file.status != "removed")
                    .map((file) => file.filename);
            }
        });
    }
}
exports.GitHubDiff = GitHubDiff;
