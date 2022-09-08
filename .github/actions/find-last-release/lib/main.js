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
const rest_1 = require("@octokit/rest");
const process_1 = require("process");
const config_service_1 = require("./config.service");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = (0, config_service_1.parseConfig)(process_1.env);
            const octokit = new rest_1.Octokit({
                auth: config.githubToken
            });
            const response = yield octokit.request('GET /repos/{owner}/{repo}/branches', Object.assign({}, config));
            if (!!response && response.status == 200) {
                var releases = response.data
                    .map(_ => _.name)
                    .filter(_ => _.startsWith('release-'))
                    .map(_ => parseInt(_.replace('release-', '')));
                const releaseBranch = `release-${Math.max(...releases)}`;
                console.log(`Last released branch : ${releaseBranch}`);
                (0, core_1.setOutput)('releaseBranch', releaseBranch);
            }
        }
        catch (error) {
            console.log(error);
            (0, core_1.setFailed)(error.message);
        }
    });
}
run();
