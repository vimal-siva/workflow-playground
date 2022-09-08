import { parseConfig } from "./config.service";
import { sets } from "./diff";
import { setFailed, setOutput, debug, warning } from "@actions/core";
import { Octokit } from "@octokit/rest";
import { env } from "process";

async function run() {
  try {
    const config = parseConfig(env);
    Octokit.plugin(require("@octokit/plugin-throttling"));

    const octokit = new Octokit({
      auth: config.githubToken,
      onRateLimit: (retryAfter, options) => {
        warning(
          `Request quota exhausted for request ${options.method} ${options.url}`
        );
        if (options.request.retryCount === 0) {
          // only retries once
          warning(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onAbuseLimit: (_, options) => {
        // does not retry, only logs a warning
        warning(
          `Abuse detected for request ${options.method} ${options.url}`
        );
      },
    });

    const response = await octokit.repos.compareCommits({ ...config });
    const differences = response.data.files
      ?.filter((file) => file.status != "removed")
      ?.map((file) => file.filename) ?? [];

    setOutput("files", differences.join(" "));

    const componentFilters = { integration: './integration/**' };
    
    let filterSets = sets(componentFilters, differences);
    Array.from(Object.entries(filterSets)).forEach(([key, matches]) => {
      debug(`files for ${key} ${matches}`);
      setOutput(key, matches.join(" "));
    });
  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();