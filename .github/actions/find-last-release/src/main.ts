import { setFailed } from "@actions/core";
import { Octokit } from "@octokit/rest";
import { env } from "process";
import { parseConfig } from './config.service';

async function run() {
  try {
    const config = parseConfig(env);

    const octokit = new Octokit({
      auth: config.githubToken
    });

    const branches = await octokit.request('GET /repos/{owner}/{repo}/branches', { ...config });
    console.log(branches);

  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();