import { Octokit } from "@octokit/rest";
import { setFailed, warning, info } from "@actions/core";

type Env = Record<string, string | undefined>;

export interface Config {
  githubToken: string;
  owner: string;
  repo: string;
  base: string;
}

function parseConfig(env: Env): Config {
  const [owner, repo] = (env.GITHUB_REPOSITORY || "").split("/", 2);
  return {
    githubToken: env.GITHUB_TOKEN || "",
    owner,
    repo,
    base: env.INPUT_BASE || "main",
  };
}

export async function getFilesModifiedFromPreviousRelease(env: Env) {
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
      warning(`Abuse detected for request ${options.method} ${options.url}`);
    },
  });

  const releases = await octokit.repos.listReleases({ ...config });

  const releasedTags = releases.data
    .filter((_) => !_.draft && !_.prerelease)
    .map((_) => _.tag_name);
  
  if (releasedTags.length < 2)
    setFailed("Failed to fetch previous release tag");

  info(`Tags to compare :: ${releasedTags[0]} & ${releasedTags[1]}`);

  const commits = await octokit.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
    owner: config.owner,
    repo: config.repo,
    basehead: `${releasedTags[1]}...${releasedTags[0]}`
  });

  return (
    commits.data.files
      ?.filter((file) => file.status != "removed")
      ?.map((file) => file.filename) ?? []
  );
}
