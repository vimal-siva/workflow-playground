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

    const response = await octokit.request('GET /repos/{owner}/{repo}/branches', { ...config });
    if (!!response && response.status == 200) {
      var releases = response.data
        .map(_ => _.name)
        .filter(_ => _.startsWith('release-'))
        .map(_ => parseInt(_.replace('release-', '')));

      console.log(`release-${Math.max(...releases)}`);      
    }

  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();