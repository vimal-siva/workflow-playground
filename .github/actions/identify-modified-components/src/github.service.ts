import { Octokit } from "@octokit/rest";
import { setFailed, info, warning } from "@actions/core";

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

function getPreviousReleaseTag(): string {
  const { exec } = require("child_process");
  var releaseTag: string = "";
  exec(
    "git rev-list --tags --max-count=1 --skip=1 --no-walk",
    (error, revision, stderr) => {
      if (error) {
        setFailed(`Could not find any revisions because: ${stderr}`);
        process.exit(1);
      }
      revision = revision.trim();

      exec(`git describe --tags ${revision}`, (error, tag, stderr) => {
        if (error) {
          setFailed(`Could not find any tags because: ${stderr}`);
          process.exit(1);
        }
        releaseTag = tag.trim();
        info(`Found tag ${tag} in revision ${revision}`);
      });
    }
  );
  return releaseTag;
}

async function compareRefs(env: Env, previousReleaseTag: string) {
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
  return await octokit.repos.compareCommits({
    ...config,
    head: previousReleaseTag,
  });
}

export async function getFilesModifiedFromPreviousRelease(env: Env) {
  const previousReleaseTag = getPreviousReleaseTag();
  const commits = await compareRefs(env, previousReleaseTag);
  return (
    commits.data.files
      ?.filter((file) => file.status != "removed")
      ?.map((file) => file.filename) ?? []
  );
}
